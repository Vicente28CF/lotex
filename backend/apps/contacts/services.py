import logging

import resend
from django.conf import settings
from django.utils import timezone
from django.utils.html import escape, linebreaks

from .models import ContactRequest


logger = logging.getLogger(__name__)


class ContactNotificationServiceError(Exception):
    pass


def send_contact_request_notification(contact_request: ContactRequest) -> dict | None:
    seller_email = contact_request.terreno.user.email
    recipient_email = settings.RESEND_TEST_TO_EMAIL or seller_email

    if not settings.RESEND_API_KEY:
        logger.info(
            "Resend no configurado; se omite notificacion para contacto %s.",
            contact_request.id,
        )
        _mark_notification_failed(contact_request, "RESEND_API_KEY no configurada.")
        return None

    if not recipient_email:
        logger.warning(
            "El terreno %s no tiene email de vendedor; se omite notificacion.",
            contact_request.terreno_id,
        )
        _mark_notification_failed(contact_request, "El vendedor no tiene email disponible.")
        return None

    resend.api_key = settings.RESEND_API_KEY
    params = _build_notification_payload(
        contact_request=contact_request,
        seller_email=seller_email,
        recipient_email=recipient_email,
    )

    try:
        response = resend.Emails.send(params)
        _mark_notification_sent(contact_request)
        return response
    except Exception as exc:
        logger.exception(
            "Fallo el envio de notificacion Resend para contacto %s hacia %s.",
            contact_request.id,
            recipient_email,
        )
        message = f"Resend error: {str(exc).strip() or 'No se pudo enviar el email.'}"
        _mark_notification_failed(contact_request, message)
        raise ContactNotificationServiceError(message) from exc


def _build_notification_payload(
    *,
    contact_request: ContactRequest,
    seller_email: str,
    recipient_email: str,
) -> dict:
    buyer_phone = contact_request.buyer_phone.strip() or "No compartido"
    subject = f"Nuevo contacto para {contact_request.terreno.title}"
    safe_message = linebreaks(escape(contact_request.message.strip()))

    return {
        "from": settings.DEFAULT_FROM_EMAIL,
        "to": [recipient_email],
        "subject": subject,
        "reply_to": contact_request.buyer_email,
        "html": f"""
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937;">
              <h2>Nuevo interes en tu terreno</h2>
              <p>Recibiste una nueva solicitud mediada desde LoteX.</p>
              {f'<p><strong>Modo prueba:</strong> este email fue redirigido a {escape(recipient_email)} para validacion.</p>' if settings.RESEND_TEST_TO_EMAIL else ''}
              <p><strong>Vendedor destino:</strong> {escape(seller_email or 'No disponible')}</p>
              <p><strong>Terreno:</strong> {escape(contact_request.terreno.title)}</p>
              <p><strong>Comprador:</strong> {escape(contact_request.buyer_name)}</p>
              <p><strong>Email:</strong> {escape(contact_request.buyer_email)}</p>
              <p><strong>Telefono:</strong> {escape(buyer_phone)}</p>
              <p><strong>Mensaje:</strong></p>
              <div>{safe_message}</div>
              <p style="margin-top: 24px;">
                Revisa tu panel de vendedor para dar seguimiento y mantener actualizado el estado del contacto.
              </p>
            </div>
        """,
    }


def _mark_notification_sent(contact_request: ContactRequest) -> None:
    contact_request.notification_status = ContactRequest.NotificationStatus.SENT
    contact_request.notification_sent_at = timezone.now()
    contact_request.notification_error = ""
    contact_request.save(
        update_fields=["notification_status", "notification_sent_at", "notification_error"]
    )


def _mark_notification_failed(contact_request: ContactRequest, message: str) -> None:
    contact_request.notification_status = ContactRequest.NotificationStatus.FAILED
    contact_request.notification_sent_at = None
    contact_request.notification_error = message[:255]
    contact_request.save(
        update_fields=["notification_status", "notification_sent_at", "notification_error"]
    )
