import django.utils.timezone
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ('alumni', '0011_alter_shippingoption_price'),
    ]

    operations = [
        migrations.AddField(
            model_name='eventregistration',
            name='last_notified_status',
            field=models.CharField(blank=True, default='', max_length=20),
        ),
        migrations.AddField(
            model_name='eventregistration',
            name='notification_sent_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='eventregistration',
            name='status',
            field=models.CharField(
                choices=[
                    ('pending', 'Pending review'),
                    ('approved', 'Approved'),
                    ('rejected', 'Rejected'),
                    ('cancelled', 'Cancelled'),
                ],
                db_index=True,
                default='pending',
                max_length=20,
            ),
        ),
        migrations.AddField(
            model_name='eventregistration',
            name='status_changed_at',
            field=models.DateTimeField(
                auto_now_add=True,
                default=django.utils.timezone.now,
            ),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='eventregistration',
            name='updated_at',
            field=models.DateTimeField(
                auto_now=True,
                default=django.utils.timezone.now,
            ),
            preserve_default=False,
        ),
    ]
