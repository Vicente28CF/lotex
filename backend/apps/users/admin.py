from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    ordering = ("-created_at",)
    list_display = (
        "email",
        "full_name",
        "role",
        "is_verified",
        "is_active",
        "is_staff",
        "created_at",
    )
    list_filter = ("role", "is_verified", "is_active", "is_staff", "is_superuser")
    search_fields = ("email", "full_name", "phone")
    readonly_fields = ("id", "created_at", "updated_at", "last_login")

    fieldsets = (
        (
            None,
            {
                "fields": ("email", "password"),
            },
        ),
        (
            "Informacion personal",
            {
                "fields": ("id", "full_name", "phone", "role", "is_verified"),
            },
        ),
        (
            "Permisos",
            {
                "fields": (
                    "is_active",
                    "is_staff",
                    "is_superuser",
                    "groups",
                    "user_permissions",
                ),
            },
        ),
        (
            "Fechas importantes",
            {
                "fields": ("last_login", "created_at", "updated_at"),
            },
        ),
    )

    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": ("email", "full_name", "password1", "password2", "role"),
            },
        ),
    )
