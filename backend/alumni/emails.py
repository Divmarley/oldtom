import logging
from functools import partial

from django.conf import settings
from django.contrib.auth.models import User
from django.core.mail import EmailMultiAlternatives
from django.db import transaction
from django.template.loader import render_to_string
from django.utils import timezone
from rest_framework.throttling import BaseThrottle

from .models import EventRegistration


logger = logging.getLogger(__name__)


EVENT_EMAIL_CONTENT = {
    EventRegistration.Status.PENDING: {
        'subject': 'Registration received — {event}',
        'heading': 'Registration received',
        'intro': (
            'We have received your registration. It is currently awaiting review, '
            'and we will email your official invitation once it is approved.'
        ),
        'status_label': 'Pending review',
        'status_color': '#b7791f',
        'cta_label': 'View event details',
    },
    EventRegistration.Status.APPROVED: {
        'subject': 'Your official invitation — {event}',
        'heading': 'You are officially invited',
        'intro': (
            'Your registration has been approved. Please accept this email as your '
            'official invitation, and bring it with you for event check-in.'
        ),
        'status_label': 'Approved',
        'status_color': '#15803d',
        'cta_label': 'View your event',
    },
    EventRegistration.Status.REJECTED: {
        'subject': 'Registration update — {event}',
        'heading': 'Registration update',
        'intro': (
            'Thank you for your interest. Unfortunately, we are unable to approve '
            'your registration for this event at this time.'
        ),
        'status_label': 'Not approved',
        'status_color': '#b91c1c',
        'cta_label': 'Explore other events',
    },
    EventRegistration.Status.CANCELLED: {
        'subject': 'Event registration cancelled — {event}',
        'heading': 'Registration cancelled',
        'intro': (
            'Your registration for this event has been cancelled. Please contact us '
            'if you believe this was a mistake.'
        ),
        'status_label': 'Cancelled',
        'status_color': '#6b7280',
        'cta_label': 'Explore other events',
    },
}


def _common_context():
    return {
        'site_name': settings.SITE_NAME,
        'site_url': settings.SITE_URL,
        'logo_url': settings.EMAIL_LOGO_URL,
        'support_email': settings.EMAIL_SUPPORT_ADDRESS,
        'current_year': timezone.now().year,
    }


def _send_templated_email(*, subject, recipient, template_name, context):
    if not recipient:
        return False

    try:
        full_context = {**_common_context(), **context}
        text_body = render_to_string(f'emails/{template_name}.txt', full_context)
        html_body = render_to_string(f'emails/{template_name}.html', full_context)
        reply_to = [settings.EMAIL_REPLY_TO] if settings.EMAIL_REPLY_TO else None

        message = EmailMultiAlternatives(
            subject=subject,
            body=text_body,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[recipient],
            reply_to=reply_to,
        )
        message.attach_alternative(html_body, 'text/html')
        return message.send(fail_silently=False) == 1
    except Exception:
        logger.exception('Unable to send %s email to %s', template_name, recipient)
        return False


def notify_event_registration(registration_id):
    try:
        registration = EventRegistration.objects.select_related('event').get(
            pk=registration_id
        )
    except EventRegistration.DoesNotExist:
        return False

    content = EVENT_EMAIL_CONTENT.get(registration.status)
    if content is None:
        logger.error(
            'Cannot notify event registration %s with unknown status %s',
            registration.pk,
            registration.status,
        )
        return False

    # Claim this status before making the SMTP call. The conditional update keeps
    # concurrent callbacks from sending the same notification twice.
    claimed = (
        EventRegistration.objects.filter(
            pk=registration.pk,
            status=registration.status,
            updated_at=registration.updated_at,
        )
        .exclude(last_notified_status=registration.status)
        .update(
            last_notified_status=registration.status,
            notification_sent_at=None,
        )
    )
    if not claimed:
        return False

    event_url = f"{settings.SITE_URL}/events"
    reference = f'OT-{registration.event_id}-{registration.pk:06d}'
    sent = _send_templated_email(
        subject=content['subject'].format(event=registration.event.title),
        recipient=registration.email,
        template_name='event_registration',
        context={
            'registration': registration,
            'event': registration.event,
            'event_url': event_url,
            'registration_reference': reference,
            **content,
        },
    )

    if sent:
        EventRegistration.objects.filter(
            pk=registration.pk,
            status=registration.status,
            updated_at=registration.updated_at,
            last_notified_status=registration.status,
        ).update(
            notification_sent_at=timezone.now(),
        )
    else:
        # Clear only our own claim so a later save/admin action can retry. If the
        # status changed while SMTP was running, leave the newer state untouched.
        EventRegistration.objects.filter(
            pk=registration.pk,
            status=registration.status,
            updated_at=registration.updated_at,
            last_notified_status=registration.status,
        ).update(
            last_notified_status='',
            notification_sent_at=None,
        )
    return sent


def schedule_event_registration_email(registration_id):
    transaction.on_commit(
        partial(notify_event_registration, registration_id),
        robust=True,
    )


def send_welcome_email(user_id):
    if not settings.WELCOME_EMAIL_NOTIFICATIONS:
        return False

    try:
        user = User.objects.select_related('alumni_profile').get(pk=user_id)
    except User.DoesNotExist:
        return False

    if not user.email:
        return False

    profile = getattr(user, 'alumni_profile', None)
    missing_field_labels = []
    if profile:
        label_by_field = dict(profile.PROFILE_REQUIRED_FIELDS)
        missing_field_labels = [
            label_by_field[field_name]
            for field_name in profile.missing_profile_fields
        ]

    return _send_templated_email(
        subject=f'Welcome to Old Toms 2016, {user.username}',
        recipient=user.email,
        template_name='welcome',
        context={
            'recipient_name': profile.name if profile else user.username,
            'username': user.username,
            'profile_complete': profile.profile_complete if profile else False,
            'missing_profile_fields': missing_field_labels,
            'profile_url': (
                f'{settings.SITE_URL}/login?next=%2Fprofile%3Fedit%3D1'
            ),
            'directory_url': f'{settings.SITE_URL}/alumni',
            'events_url': f'{settings.SITE_URL}/events',
        },
    )


def schedule_welcome_email(user_id):
    transaction.on_commit(
        partial(send_welcome_email, user_id),
        robust=True,
    )


def send_login_notification(user, request=None):
    if not settings.LOGIN_EMAIL_NOTIFICATIONS or not user.email:
        return False

    ip_address = BaseThrottle().get_ident(request) if request else 'Unavailable'
    user_agent = (
        request.META.get('HTTP_USER_AGENT', '')[:300]
        if request
        else ''
    ) or 'Unavailable'

    return _send_templated_email(
        subject='New sign-in to your Old Toms account',
        recipient=user.email,
        template_name='login_notice',
        context={
            'recipient_name': user.get_full_name() or user.username,
            'username': user.username,
            'login_time': timezone.localtime(),
            'ip_address': ip_address,
            'user_agent': user_agent,
            'account_url': f"{settings.SITE_URL}/profile",
        },
    )
