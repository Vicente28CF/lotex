import logging
import secrets

import resend
from django.conf import settings
from django.utils import timezone
from django.utils.html import escape


logger = logging.getLogger(__name__)


def generate_verification_token() -> str:
    """Genera un token seguro apto para URL."""
    return secrets.token_urlsafe(32)


def send_verification_email(user) -> bool:
    recipient_email = settings.RESEND_TEST_TO_EMAIL or user.email

    if not settings.RESEND_API_KEY:
        logger.info(
            "Resend no configurado; se omite email de verificacion para usuario %s.",
            user.id,
        )
        return False

    if not recipient_email:
        logger.warning(
            "Usuario %s sin email destino; se omite email de verificacion.",
            user.id,
        )
        return False

    token = generate_verification_token()
    user.email_verification_token = token
    user.email_verification_sent_at = timezone.now()
    user.save(update_fields=["email_verification_token", "email_verification_sent_at"])

    frontend_url = getattr(settings, "FRONTEND_URL", "http://localhost:3000").rstrip("/")
    verification_url = f"{frontend_url}/verificar-email?token={token}"

    resend.api_key = settings.RESEND_API_KEY

    params = {
        "from": settings.DEFAULT_FROM_EMAIL,
        "to": [recipient_email],
        "subject": "Verifica tu cuenta en Terrify",
        "html": f"""
            <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; color: #1f2937;">
              <h2 style="color: #1f1f1f; font-size: 24px; margin-bottom: 8px;">
                Bienvenido a Terrify
              </h2>
              <p style="color: #6a6a6a; font-size: 16px; line-height: 1.6;">
                Hola {escape(user.full_name or 'por ahi')}, gracias por registrarte.<br/>
                Confirma tu correo para activar tu cuenta.
              </p>
              {f'<p style="color: #6a6a6a; font-size: 14px;"><strong>Modo prueba:</strong> este email fue redirigido a {escape(recipient_email)} para validacion.</p>' if settings.RESEND_TEST_TO_EMAIL else ''}
              <a href="{escape(verification_url)}"
                 style="display: inline-block; margin-top: 24px; padding: 14px 28px; background: #ff385c; color: white; border-radius: 999px; text-decoration: none; font-weight: bold; font-size: 15px;">
                Verificar mi cuenta
              </a>
              <p style="margin-top: 24px; color: #9a9a9a; font-size: 13px;">
                Este enlace expira en 24 horas.<br/>
                Si no creaste esta cuenta, ignora este mensaje.
              </p>
              <hr style="margin-top: 32px; border: none; border-top: 1px solid #eee;"/>
              <p style="color: #c0c0c0; font-size: 12px; margin-top: 16px;">
                Terrify · Jalisco, Mexico
              </p>
            </div>
        """,
    }

    try:
        resend.Emails.send(params)
        logger.info("Email de verificacion enviado a %s.", recipient_email)
        return True
    except Exception:
        logger.exception(
            "Error enviando email de verificacion para usuario %s hacia %s.",
            user.id,
            recipient_email,
        )
        return False


def send_welcome_email(user) -> bool:
    recipient_email = settings.RESEND_TEST_TO_EMAIL or user.email

    if not settings.RESEND_API_KEY:
        logger.info(
            "Resend no configurado; se omite email de bienvenida para usuario %s.",
            user.id,
        )
        return False

    if not recipient_email:
        logger.warning(
            "Usuario %s sin email destino; se omite email de bienvenida.",
            user.id,
        )
        return False

    resend.api_key = settings.RESEND_API_KEY
    frontend_url = getattr(settings, "FRONTEND_URL", "http://localhost:3000").rstrip("/")

    params = {
        "from": settings.DEFAULT_FROM_EMAIL,
        "to": [recipient_email],
        "subject": "Tu cuenta esta lista! - Terrify",
        "html": f"""
            <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; color: #1f2937;">
              <h2 style="color: #1f1f1f; font-size: 24px; margin-bottom: 8px;">
                Todo listo, {escape(user.full_name or 'bienvenido')}!
              </h2>
              <p style="color: #6a6a6a; font-size: 16px; line-height: 1.6;">
                Tu cuenta en Terrify esta verificada y activa.<br/>
                Ya puedes explorar terrenos, guardar favoritos y contactar vendedores.
              </p>
              {f'<p style="color: #6a6a6a; font-size: 14px;"><strong>Modo prueba:</strong> este email fue redirigido a {escape(recipient_email)} para validacion.</p>' if settings.RESEND_TEST_TO_EMAIL else ''}
              <a href="{escape(frontend_url)}"
                 style="display: inline-block; margin-top: 24px; padding: 14px 28px; background: #ff385c; color: white; border-radius: 999px; text-decoration: none; font-weight: bold; font-size: 15px;">
                Explorar terrenos
              </a>
              <hr style="margin-top: 32px; border: none; border-top: 1px solid #eee;"/>
              <p style="color: #c0c0c0; font-size: 12px; margin-top: 16px;">
                Terrify · Jalisco, Mexico
              </p>
            </div>
        """,
    }

    try:
        resend.Emails.send(params)
        logger.info("Email de bienvenida enviado a %s.", recipient_email)
        return True
    except Exception:
        logger.exception(
            "Error enviando email de bienvenida para usuario %s hacia %s.",
            user.id,
            recipient_email,
        )
        return False
