from django.db import migrations, models


def normalize_registration_emails(apps, schema_editor):
    EventRegistration = apps.get_model('alumni', 'EventRegistration')
    database = schema_editor.connection.alias
    registrations = list(EventRegistration.objects.using(database).all())
    seen = {}

    for registration in registrations:
        normalized_email = registration.email.strip().lower()
        key = (registration.event_id, normalized_email)
        if key in seen:
            raise RuntimeError(
                'Duplicate event registrations must be resolved before applying '
                f'this migration (rows {seen[key]} and {registration.pk}).'
            )
        seen[key] = registration.pk
        registration.email = normalized_email

    EventRegistration.objects.using(database).bulk_update(registrations, ['email'])


class Migration(migrations.Migration):
    dependencies = [
        ('alumni', '0012_eventregistration_email_status'),
    ]

    operations = [
        migrations.RunPython(
            normalize_registration_emails,
            migrations.RunPython.noop,
        ),
        migrations.AddConstraint(
            model_name='eventregistration',
            constraint=models.UniqueConstraint(
                fields=('event', 'email'),
                name='unique_event_registration_email',
            ),
        ),
    ]
