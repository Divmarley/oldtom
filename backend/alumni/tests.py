from io import BytesIO
from tempfile import TemporaryDirectory
from unittest.mock import patch

from PIL import Image
from django.core.cache import cache
from django.core import mail
from django.core.files.uploadedfile import SimpleUploadedFile
from django.db import IntegrityError, transaction
from django.test import TestCase, override_settings
from django.contrib.auth.models import User
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import AccessToken

from .models import Alumni, Event, EventRegistration, Project
from .serializers import ProductSerializer


class ProductSerializerTests(TestCase):
    def test_create_product_without_slug_generates_slug(self):
        payload = {
            'title': 'Old Toms Tee',
            'description': 'Classic alumni tee',
            'price': '39.99',
            'stock': 12,
        }

        serializer = ProductSerializer(data=payload)

        self.assertTrue(serializer.is_valid(), serializer.errors)
        product = serializer.save()

        self.assertEqual(product.slug, 'old-toms-tee')
        self.assertEqual(product.title, 'Old Toms Tee')


class ProfilePhotoTests(APITestCase):
    def setUp(self):
        self.media_directory = TemporaryDirectory()
        self.media_settings = self.settings(MEDIA_ROOT=self.media_directory.name)
        self.media_settings.enable()
        self.addCleanup(self.media_directory.cleanup)
        self.addCleanup(self.media_settings.disable)

        self.user = User.objects.create_user(
            username='photo-member', password='member-password'
        )
        self.profile = Alumni.objects.create(
            user=self.user,
            name='Photo Member',
            email='photo-member@example.com',
            profession='Designer',
            location='Accra',
            bio='Alumni member',
        )
        self.client.force_authenticate(self.user)

    def test_user_can_set_and_remove_profile_photo(self):
        image_data = BytesIO()
        Image.new('RGB', (2, 2), color='blue').save(image_data, format='PNG')
        photo = SimpleUploadedFile(
            'profile.png', image_data.getvalue(), content_type='image/png'
        )

        response = self.client.put(
            '/api/auth/profile/', {'photo': photo}, format='multipart'
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.profile.refresh_from_db()
        self.assertTrue(self.profile.photo.name.startswith('alumni_photos/'))

        response = self.client.put(
            '/api/auth/profile/', {'photo': None}, format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.profile.refresh_from_db()
        self.assertFalse(self.profile.photo)


@override_settings(
    EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend',
    DEFAULT_FROM_EMAIL='Old Toms <noreply@oldtoms.test>',
    EMAIL_REPLY_TO='info@oldtoms.test',
    EMAIL_SUPPORT_ADDRESS='support@oldtoms.test',
    SITE_URL='https://oldtoms.test',
    EMAIL_LOGO_URL='https://oldtoms.test/logo.jpg',
    WELCOME_EMAIL_NOTIFICATIONS=True,
)
class AccountWelcomeEmailTests(APITestCase):
    def setUp(self):
        cache.clear()
        mail.outbox.clear()

    @staticmethod
    def account_payload(**overrides):
        return {
            'username': 'welcome-member',
            'email': 'WELCOME@example.com',
            'password': 'secure-member-password',
            **overrides,
        }

    def test_registration_sends_branded_html_welcome_email_with_profile_cta(self):
        with self.captureOnCommitCallbacks(execute=True):
            response = self.client.post(
                '/api/auth/register/',
                self.account_payload(),
                format='json',
            )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(username='welcome-member').exists())
        self.assertTrue(
            Alumni.objects.filter(user__username='welcome-member').exists()
        )
        self.assertEqual(len(mail.outbox), 1)

        message = mail.outbox[0]
        self.assertIn('Welcome to Old Toms', message.subject)
        self.assertEqual(message.to, ['welcome@example.com'])
        self.assertEqual(len(message.alternatives), 1)
        self.assertEqual(message.alternatives[0].mimetype, 'text/html')

        html_body = message.alternatives[0].content
        profile_url = (
            'https://oldtoms.test/login?next=%2Fprofile%3Fedit%3D1'
        )
        self.assertIn('Welcome to the Old Toms network', html_body)
        self.assertIn('Complete your profile', html_body)
        self.assertIn(profile_url, html_body)
        self.assertIn(profile_url, message.body)

    def test_profile_completion_metadata_updates_after_profile_update(self):
        with self.captureOnCommitCallbacks(execute=True):
            response = self.client.post(
                '/api/auth/register/',
                self.account_payload(),
                format='json',
            )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        user = User.objects.get(username='welcome-member')
        self.client.force_authenticate(user)

        response = self.client.get('/api/auth/profile/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(response.data['profile_complete'])
        self.assertEqual(response.data['profile_completion_percentage'], 40)
        self.assertEqual(
            response.data['missing_profile_fields'],
            ['profession', 'location', 'bio'],
        )

        response = self.client.put(
            '/api/auth/profile/',
            {
                'profession': 'Software Engineer',
                'location': 'Accra',
                'bio': 'Building useful software for the alumni community.',
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['profile_complete'])
        self.assertEqual(response.data['profile_completion_percentage'], 100)
        self.assertEqual(response.data['missing_profile_fields'], [])

    def test_profile_email_update_keeps_account_email_in_sync(self):
        with self.captureOnCommitCallbacks(execute=True):
            response = self.client.post(
                '/api/auth/register/',
                self.account_payload(),
                format='json',
            )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        user = User.objects.get(username='welcome-member')
        self.client.force_authenticate(user)

        response = self.client.put(
            '/api/auth/profile/',
            {'email': 'UPDATED@example.com'},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        user.refresh_from_db()
        self.assertEqual(user.email, 'updated@example.com')
        self.assertEqual(response.data['email'], 'updated@example.com')

    def test_registration_requires_an_email_address(self):
        payload = self.account_payload()
        payload.pop('email')

        with self.captureOnCommitCallbacks(execute=True):
            response = self.client.post(
                '/api/auth/register/',
                payload,
                format='json',
            )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('email', response.data)
        self.assertEqual(User.objects.count(), 0)
        self.assertEqual(Alumni.objects.count(), 0)
        self.assertEqual(len(mail.outbox), 0)

    def test_registration_rejects_a_case_insensitive_duplicate_email(self):
        with self.captureOnCommitCallbacks(execute=True):
            first_response = self.client.post(
                '/api/auth/register/',
                self.account_payload(email='member@example.com'),
                format='json',
            )

        self.assertEqual(first_response.status_code, status.HTTP_201_CREATED)
        mail.outbox.clear()

        with self.captureOnCommitCallbacks(execute=True):
            duplicate_response = self.client.post(
                '/api/auth/register/',
                self.account_payload(
                    username='second-member',
                    email='MEMBER@EXAMPLE.COM',
                ),
                format='json',
            )

        self.assertEqual(
            duplicate_response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )
        self.assertIn('email', duplicate_response.data)
        self.assertEqual(User.objects.count(), 1)
        self.assertEqual(Alumni.objects.count(), 1)
        self.assertEqual(len(mail.outbox), 0)

    @patch(
        'alumni.emails.EmailMultiAlternatives.send',
        side_effect=RuntimeError('SMTP unavailable'),
    )
    def test_smtp_failure_does_not_roll_back_account_registration(self, _mock_send):
        with self.captureOnCommitCallbacks(execute=True):
            response = self.client.post(
                '/api/auth/register/',
                self.account_payload(),
                format='json',
            )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        user = User.objects.get(username='welcome-member')
        self.assertEqual(user.email, 'welcome@example.com')
        self.assertTrue(Alumni.objects.filter(user=user).exists())


@override_settings(
    EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend',
    DEFAULT_FROM_EMAIL='Old Toms <noreply@oldtoms.test>',
    EMAIL_REPLY_TO='events@oldtoms.test',
    EMAIL_SUPPORT_ADDRESS='support@oldtoms.test',
    SITE_URL='https://oldtoms.test',
    EMAIL_LOGO_URL='https://oldtoms.test/logo.jpg',
    LOGIN_EMAIL_NOTIFICATIONS=True,
)
class EmailNotificationTests(APITestCase):
    def setUp(self):
        cache.clear()
        self.event = Event.objects.create(
            title='Founders Day',
            date='2026-09-12T18:00:00Z',
            location='Accra Alumni Hall',
            description='Annual alumni gathering',
        )
        self.admin = User.objects.create_user(
            username='email-admin',
            email='admin@oldtoms.test',
            password='admin-password',
            is_staff=True,
        )
        mail.outbox.clear()

    def registration_payload(self, **overrides):
        return {
            'event': self.event.pk,
            'name': 'Ama Mensah',
            'email': 'ama@example.com',
            'phone': '+233200000000',
            'alumni_id': 'OT-2016-001',
            **overrides,
        }

    def test_new_registration_is_pending_and_sends_html_receipt(self):
        with self.captureOnCommitCallbacks(execute=True):
            response = self.client.post(
                '/api/event-registration/',
                self.registration_payload(status=EventRegistration.Status.APPROVED),
                format='json',
            )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        registration = EventRegistration.objects.get(pk=response.data['id'])
        self.assertEqual(registration.status, EventRegistration.Status.PENDING)
        self.assertEqual(registration.last_notified_status, registration.status)
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn('Registration received', mail.outbox[0].subject)
        self.assertEqual(mail.outbox[0].to, ['ama@example.com'])
        self.assertTrue(mail.outbox[0].alternatives)
        self.assertEqual(mail.outbox[0].alternatives[0].mimetype, 'text/html')

    def test_duplicate_event_registration_is_rejected_without_another_email(self):
        with self.captureOnCommitCallbacks(execute=True):
            first_response = self.client.post(
                '/api/event-registration/',
                self.registration_payload(),
                format='json',
            )

        mail.outbox.clear()
        with self.captureOnCommitCallbacks(execute=True):
            duplicate_response = self.client.post(
                '/api/event-registration/',
                self.registration_payload(email='AMA@EXAMPLE.COM'),
                format='json',
            )

        self.assertEqual(first_response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(duplicate_response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(EventRegistration.objects.count(), 1)
        self.assertEqual(len(mail.outbox), 0)

    def test_database_prevents_concurrent_duplicate_registration(self):
        EventRegistration.objects.create(
            event=self.event,
            name='Ama Mensah',
            email='ama@example.com',
            phone='+233200000000',
        )

        with self.assertRaises(IntegrityError), transaction.atomic():
            EventRegistration.objects.create(
                event=self.event,
                name='Ama Mensah Again',
                email='AMA@EXAMPLE.COM',
                phone='+233211111111',
            )

    def test_admin_approval_sends_one_official_invitation(self):
        registration = EventRegistration.objects.create(
            event=self.event,
            name='Ama Mensah',
            email='ama@example.com',
            phone='+233200000000',
            status=EventRegistration.Status.PENDING,
            last_notified_status=EventRegistration.Status.PENDING,
            notification_sent_at=timezone.now(),
        )
        self.client.force_authenticate(self.admin)

        with self.captureOnCommitCallbacks(execute=True):
            response = self.client.patch(
                f'/api/event-registration/{registration.pk}/',
                {'status': EventRegistration.Status.APPROVED},
                format='json',
            )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        registration.refresh_from_db()
        self.assertEqual(registration.status, EventRegistration.Status.APPROVED)
        self.assertEqual(
            registration.last_notified_status,
            EventRegistration.Status.APPROVED,
        )
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn('official invitation', mail.outbox[0].subject.lower())
        self.assertIn('official invitation', mail.outbox[0].body.lower())

        mail.outbox.clear()
        with self.captureOnCommitCallbacks(execute=True):
            response = self.client.patch(
                f'/api/event-registration/{registration.pk}/',
                {'notes': 'Window seat'},
                format='json',
            )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(mail.outbox), 0)

    def test_admin_rejection_sends_status_update_not_invitation(self):
        registration = EventRegistration.objects.create(
            event=self.event,
            name='Ama Mensah',
            email='ama@example.com',
            phone='+233200000000',
            status=EventRegistration.Status.PENDING,
            last_notified_status=EventRegistration.Status.PENDING,
            notification_sent_at=timezone.now(),
        )
        self.client.force_authenticate(self.admin)

        with self.captureOnCommitCallbacks(execute=True):
            response = self.client.patch(
                f'/api/event-registration/{registration.pk}/',
                {'status': EventRegistration.Status.REJECTED},
                format='json',
            )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        registration.refresh_from_db()
        self.assertEqual(registration.status, EventRegistration.Status.REJECTED)
        self.assertEqual(
            registration.last_notified_status,
            EventRegistration.Status.REJECTED,
        )
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn('registration update', mail.outbox[0].subject.lower())
        self.assertNotIn('official invitation', mail.outbox[0].body.lower())

    def test_correcting_email_resends_the_current_invitation(self):
        registration = EventRegistration.objects.create(
            event=self.event,
            name='Ama Mensah',
            email='wrong@example.com',
            phone='+233200000000',
            status=EventRegistration.Status.APPROVED,
            last_notified_status=EventRegistration.Status.APPROVED,
            notification_sent_at=timezone.now(),
        )
        self.client.force_authenticate(self.admin)

        with self.captureOnCommitCallbacks(execute=True):
            response = self.client.patch(
                f'/api/event-registration/{registration.pk}/',
                {'email': 'RIGHT@EXAMPLE.COM'},
                format='json',
            )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        registration.refresh_from_db()
        self.assertEqual(registration.email, 'right@example.com')
        self.assertEqual(len(mail.outbox), 1)
        self.assertEqual(mail.outbox[0].to, ['right@example.com'])
        self.assertIn('official invitation', mail.outbox[0].subject.lower())

    @patch(
        'alumni.emails.EmailMultiAlternatives.send',
        side_effect=RuntimeError('SMTP unavailable'),
    )
    def test_email_failure_does_not_fail_registration(self, _mock_send):
        with self.captureOnCommitCallbacks(execute=True):
            response = self.client.post(
                '/api/event-registration/',
                self.registration_payload(),
                format='json',
            )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        registration = EventRegistration.objects.get(pk=response.data['id'])
        self.assertEqual(registration.last_notified_status, '')

    @patch(
        'alumni.emails.render_to_string',
        side_effect=RuntimeError('Template unavailable'),
    )
    def test_template_failure_does_not_fail_registration(self, _mock_render):
        with self.captureOnCommitCallbacks(execute=True):
            response = self.client.post(
                '/api/event-registration/',
                self.registration_payload(),
                format='json',
            )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        registration = EventRegistration.objects.get(pk=response.data['id'])
        self.assertEqual(registration.last_notified_status, '')

    def test_anonymous_registration_is_rate_limited(self):
        for index in range(5):
            with self.captureOnCommitCallbacks(execute=True):
                response = self.client.post(
                    '/api/event-registration/',
                    self.registration_payload(email=f'guest-{index}@example.com'),
                    format='json',
                )
            self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        response = self.client.post(
            '/api/event-registration/',
            self.registration_payload(email='guest-over-limit@example.com'),
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_429_TOO_MANY_REQUESTS)

    def test_successful_login_sends_security_notice_only_on_success(self):
        user = User.objects.create_user(
            username='login-member',
            email='member@oldtoms.test',
            password='member-password',
        )

        response = self.client.post(
            '/api/auth/login/',
            {'username': user.username, 'password': 'member-password'},
            format='json',
            HTTP_USER_AGENT='Test Browser',
            REMOTE_ADDR='203.0.113.10',
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn('New sign-in', mail.outbox[0].subject)
        self.assertIn('203.0.113.10', mail.outbox[0].body)

        mail.outbox.clear()
        response = self.client.post(
            '/api/auth/login/',
            {'username': user.username, 'password': 'wrong-password'},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(len(mail.outbox), 0)


class RolePermissionTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='member', password='member-password'
        )
        self.other_user = User.objects.create_user(
            username='other-member', password='other-password'
        )
        self.admin = User.objects.create_user(
            username='admin', password='admin-password', is_staff=True
        )

    def test_event_and_product_writes_require_an_admin(self):
        event_payload = {
            'title': 'Founders Day',
            'date': '2026-08-22T10:00:00Z',
            'location': 'Accra',
            'description': 'Annual alumni event',
        }
        product_payload = {
            'title': 'Old Toms Tee',
            'description': 'Classic alumni tee',
            'price': '39.99',
            'stock': 12,
        }

        response = self.client.post('/api/events/', event_payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        self.client.force_authenticate(self.user)
        response = self.client.post('/api/events/', event_payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        response = self.client.post('/api/products/', product_payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        self.client.force_authenticate(self.admin)
        response = self.client.post('/api/events/', event_payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        response = self.client.post('/api/products/', product_payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_user_can_only_update_their_own_project(self):
        project = Project.objects.create(
            title='Library Fund',
            description='Improve the alumni library',
            proposer=self.user,
        )

        self.client.force_authenticate(self.other_user)
        response = self.client.patch(
            f'/api/projects/{project.pk}/', {'title': 'Changed'}, format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        self.client.force_authenticate(self.user)
        response = self.client.patch(
            f'/api/projects/{project.pk}/', {'title': 'Member Change'}, format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.client.force_authenticate(self.admin)
        response = self.client.patch(
            f'/api/projects/{project.pk}/', {'title': 'Admin Change'}, format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_registration_cannot_assign_staff_status(self):
        response = self.client.post(
            '/api/auth/register/',
            {
                'username': 'new-member',
                'email': 'new-member@example.com',
                'password': 'secure-member-password',
                'is_staff': True,
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertFalse(User.objects.get(username='new-member').is_staff)

    def test_user_api_is_scoped_to_the_current_user(self):
        self.client.force_authenticate(self.user)
        response = self.client.get('/api/users/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual([entry['id'] for entry in response.data], [self.user.id])

        response = self.client.get(f'/api/users/{self.other_user.id}/')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

        self.client.force_authenticate(self.admin)
        response = self.client.get('/api/users/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            {entry['id'] for entry in response.data},
            {self.user.id, self.other_user.id, self.admin.id},
        )

    def test_deleted_user_token_does_not_block_public_reads(self):
        Event.objects.create(
            title='Open Event',
            date='2026-08-22T10:00:00Z',
            location='Accra',
            description='Visible to all visitors',
        )
        token = AccessToken.for_user(self.user)
        self.user.delete()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

        response = self.client.get('/api/events/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
