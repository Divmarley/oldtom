from django.contrib import admin
from django.utils import timezone

from .emails import schedule_event_registration_email
from .models import (
    Alumni,
    AlumniRosterEntry,
    ContactMessage,
    Event,
    EventRegistration,
    School,
)

@admin.register(Alumni)
class AlumniAdmin(admin.ModelAdmin):
    list_display = ('name', 'profession', 'category', 'location', 'email')
    search_fields = ('name', 'profession', 'skills', 'category')
    list_filter = ('category', 'location')

@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ('title', 'date', 'location')
    search_fields = ('title', 'location')
    list_filter = ('date',)


@admin.register(School)
class SchoolAdmin(admin.ModelAdmin):
    list_display = ('name', 'kind', 'is_active', 'sort_order')
    list_filter = ('kind', 'is_active')
    list_editable = ('is_active', 'sort_order')
    search_fields = ('name',)


@admin.register(AlumniRosterEntry)
class AlumniRosterEntryAdmin(admin.ModelAdmin):
    list_display = (
        'full_name',
        'batch_year',
        'email',
        'alumni_id',
        'is_active',
    )
    list_filter = ('is_active', 'batch_year')
    list_editable = ('is_active',)
    search_fields = ('full_name', 'email', 'alumni_id')
    readonly_fields = ('created_at', 'updated_at')

@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'created_at')
    search_fields = ('name', 'email', 'message')
    readonly_fields = ('created_at',)


@admin.register(EventRegistration)
class EventRegistrationAdmin(admin.ModelAdmin):
    list_display = (
        'name',
        'event',
        'email',
        'attendee_type',
        'school',
        'batch_year',
        'roster_match_status',
        'status',
        'registered_at',
        'notification_sent_at',
    )
    list_filter = (
        'status',
        'attendee_type',
        'roster_match_status',
        'school',
        'batch_year',
        'event',
        'registered_at',
    )
    search_fields = (
        'name',
        'email',
        'phone',
        'alumni_id',
        'other_school_name',
        'matched_roster_entry__full_name',
        'event__title',
    )
    list_select_related = ('event', 'school', 'matched_roster_entry')
    readonly_fields = (
        'matched_roster_entry',
        'roster_match_status',
        'roster_matched_at',
        'registered_at',
        'updated_at',
        'status_changed_at',
        'last_notified_status',
        'notification_sent_at',
    )
    actions = (
        'approve_registrations',
        'reject_registrations',
        'cancel_registrations',
        'resend_notifications',
        'recheck_roster_matches',
    )

    def save_model(self, request, obj, form, change):
        previous = None
        if change and obj.pk:
            previous = EventRegistration.objects.filter(pk=obj.pk).values(
                'status',
                'email',
                'event_id',
                'attendee_type',
                'school_id',
                'other_school_name',
                'batch_year',
                'alumni_id',
            ).first()

        obj.email = obj.email.strip().lower()
        status_changed = previous is None or previous['status'] != obj.status
        delivery_changed = (
            previous is None
            or status_changed
            or previous['email'] != obj.email
            or previous['event_id'] != obj.event_id
            or previous['attendee_type'] != obj.attendee_type
            or previous['school_id'] != obj.school_id
            or previous['other_school_name'] != obj.other_school_name
            or previous['batch_year'] != obj.batch_year
            or previous['alumni_id'] != obj.alumni_id
        )

        if status_changed:
            obj.status_changed_at = timezone.now()

        if delivery_changed:
            obj.last_notified_status = ''
            obj.notification_sent_at = None

        obj.refresh_roster_match()

        super().save_model(request, obj, form, change)
        if delivery_changed or obj.last_notified_status != obj.status:
            schedule_event_registration_email(obj.pk)

    def _set_registration_status(self, request, queryset, next_status):
        queued = 0
        for registration in queryset:
            if registration.status != next_status:
                registration.status = next_status
                registration.status_changed_at = timezone.now()
                registration.last_notified_status = ''
                registration.notification_sent_at = None
                registration.save(
                    update_fields=(
                        'status',
                        'status_changed_at',
                        'last_notified_status',
                        'notification_sent_at',
                        'updated_at',
                    )
                )

            if registration.last_notified_status != registration.status:
                schedule_event_registration_email(registration.pk)
                queued += 1

        self.message_user(request, f'{queued} email notification(s) processed.')

    @admin.action(description='Approve selected registrations and send invitations')
    def approve_registrations(self, request, queryset):
        self._set_registration_status(
            request,
            queryset,
            EventRegistration.Status.APPROVED,
        )

    @admin.action(description='Reject selected registrations and notify guests')
    def reject_registrations(self, request, queryset):
        self._set_registration_status(
            request,
            queryset,
            EventRegistration.Status.REJECTED,
        )

    @admin.action(description='Cancel selected registrations and notify guests')
    def cancel_registrations(self, request, queryset):
        self._set_registration_status(
            request,
            queryset,
            EventRegistration.Status.CANCELLED,
        )

    @admin.action(description='Resend the current notification to selected guests')
    def resend_notifications(self, request, queryset):
        processed = 0
        for registration in queryset:
            registration.last_notified_status = ''
            registration.notification_sent_at = None
            registration.save(
                update_fields=(
                    'last_notified_status',
                    'notification_sent_at',
                    'updated_at',
                )
            )
            schedule_event_registration_email(registration.pk)
            processed += 1

        self.message_user(request, f'{processed} email notification(s) processed.')

    @admin.action(description='Recheck selected registrations against the roster')
    def recheck_roster_matches(self, request, queryset):
        processed = 0
        for registration in queryset:
            registration.refresh_roster_match()
            registration.save(
                update_fields=(
                    'matched_roster_entry',
                    'roster_match_status',
                    'roster_matched_at',
                    'updated_at',
                )
            )
            processed += 1

        self.message_user(request, f'{processed} registration(s) rechecked.')
