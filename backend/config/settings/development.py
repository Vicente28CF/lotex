from .base import *

DEBUG = True

ALLOWED_HOSTS = ["*"]

# En desarrollo mostramos las queries SQL en consola
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "handlers": {
        "console": {"class": "logging.StreamHandler"},
    },
    "loggers": {
        "django.db.backends": {
            "handlers": ["console"],
            "level": "DEBUG",
        },
    },
}

# CORS abierto en desarrollo
CORS_ALLOW_ALL_ORIGINS = True

# Seguridad desactivada en local (no tenemos HTTPS)
SECURE_SSL_REDIRECT = False
SESSION_COOKIE_SECURE = False
CSRF_COOKIE_SECURE = False