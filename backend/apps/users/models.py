import uuid
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.db import models


class UserManager(BaseUserManager):
    """Manager personalizado — usamos email en vez de username."""

    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("El email es obligatorio")
        email = self.normalize_email(email)
        extra_fields.setdefault("is_active", True)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("role", User.Role.ADMIN)
        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    """
    Usuario personalizado de Terrify.
    Roles:
      - normal  -> puede publicar hasta 3 terrenos gratis
      - agent   -> agente/inmobiliaria verificada (plan de pago)
      - admin   -> administrador del sistema
    """

    class Role(models.TextChoices):
        NORMAL = "normal", "Usuario normal"
        AGENT  = "agent",  "Agente / Inmobiliaria"
        ADMIN  = "admin",  "Administrador"

    id          = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email       = models.EmailField(unique=True)
    google_id   = models.CharField(max_length=255, null=True, blank=True, unique=True)
    full_name   = models.CharField(max_length=150)
    phone       = models.CharField(max_length=20, blank=True)
    role        = models.CharField(max_length=10, choices=Role.choices, default=Role.NORMAL)
    is_verified = models.BooleanField(default=False)
    email_verified = models.BooleanField(default=False)
    email_verification_token = models.CharField(max_length=64, null=True, blank=True, unique=True)
    email_verification_sent_at = models.DateTimeField(null=True, blank=True)
    is_active   = models.BooleanField(default=True)
    is_staff    = models.BooleanField(default=False)
    created_at  = models.DateTimeField(auto_now_add=True)
    updated_at  = models.DateTimeField(auto_now=True)

    objects = UserManager()

    USERNAME_FIELD  = "email"
    REQUIRED_FIELDS = ["full_name"]

    class Meta:
        db_table            = "users"
        verbose_name        = "Usuario"
        verbose_name_plural = "Usuarios"
        ordering            = ["-created_at"]

    def __str__(self):
        return f"{self.full_name} <{self.email}>"

    @property
    def is_agent(self):
        return self.role == self.Role.AGENT

    @property
    def is_admin_user(self):
        return self.role == self.Role.ADMIN

    @property
    def can_publish(self):
        """Un usuario normal puede publicar maximo 3 terrenos."""
        if self.role in (self.Role.AGENT, self.Role.ADMIN):
            return True
        return self.terrenos.filter(status="active").count() < 3
