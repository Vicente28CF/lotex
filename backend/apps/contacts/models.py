import uuid
from django.db import models
from django.conf import settings


class ContactRequest(models.Model):
    class NotificationStatus(models.TextChoices):
        PENDING = "pending", "Pendiente"
        SENT = "sent", "Enviada"
        FAILED = "failed", "Fallida"

    class Status(models.TextChoices):
        PENDING = "pending", "Pendiente"
        READ    = "read",    "Leido"
        REPLIED = "replied", "Respondido"

    id          = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    terreno     = models.ForeignKey(
                    "terrenos.Terreno",
                    on_delete=models.CASCADE,
                    related_name="contact_requests"
                  )
    buyer       = models.ForeignKey(
                    settings.AUTH_USER_MODEL,
                    on_delete=models.SET_NULL,
                    null=True, blank=True,
                    related_name="contact_requests_sent"
                  )
    buyer_name  = models.CharField(max_length=150)
    buyer_email = models.EmailField()
    buyer_phone = models.CharField(max_length=20, blank=True)
    message     = models.TextField(max_length=1000)
    status      = models.CharField(max_length=10, choices=Status.choices, default=Status.PENDING)
    notification_status = models.CharField(
        max_length=10,
        choices=NotificationStatus.choices,
        default=NotificationStatus.PENDING,
    )
    notification_sent_at = models.DateTimeField(null=True, blank=True)
    notification_error = models.CharField(max_length=255, blank=True)
    created_at  = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table            = "contact_requests"
        verbose_name        = "Solicitud de contacto"
        verbose_name_plural = "Solicitudes de contacto"
        ordering            = ["-created_at"]

    def __str__(self):
        return f"{self.buyer_name} interesado en {self.terreno.title}"
