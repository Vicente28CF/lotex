from .base import *

DEBUG = True

ALLOWED_HOSTS = ["*"]

# En desarrollo mostramos las queries SQL en consola
LOGGING = {
    **LOGGING,
    "loggers": {
        **LOGGING["loggers"],
        "django.db.backends": {
            "handlers": ["console"],
            "level": "DEBUG",
            "propagate": False,
        },
    },
}

# CORS abierto en desarrollo
CORS_ALLOW_ALL_ORIGINS = True

# Seguridad desactivada en local (no tenemos HTTPS)
SECURE_SSL_REDIRECT = False
SESSION_COOKIE_SECURE = False
CSRF_COOKIE_SECURE = False
