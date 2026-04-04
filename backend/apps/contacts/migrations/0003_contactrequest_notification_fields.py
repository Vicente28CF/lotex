from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("contacts", "0002_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="contactrequest",
            name="notification_error",
            field=models.CharField(blank=True, max_length=255),
        ),
        migrations.AddField(
            model_name="contactrequest",
            name="notification_sent_at",
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="contactrequest",
            name="notification_status",
            field=models.CharField(
                choices=[("pending", "Pendiente"), ("sent", "Enviada"), ("failed", "Fallida")],
                default="pending",
                max_length=10,
            ),
        ),
    ]
