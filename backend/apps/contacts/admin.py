from django.contrib import admin

from .models import ContactRequest


@admin.register(ContactRequest)
class ContactRequestAdmin(admin.ModelAdmin):
    list_display = (
        "buyer_name",
        "buyer_email",
        "terreno",
        "buyer",
        "status",
        "notification_status",
        "created_at",
    )
    list_filter = ("status", "notification_status", "created_at")
    search_fields = (
        "buyer_name",
        "buyer_email",
        "buyer_phone",
        "terreno__title",
        "buyer__email",
        "buyer__full_name",
    )
    readonly_fields = (
        "id",
        "notification_status",
        "notification_sent_at",
        "notification_error",
        "created_at",
    )
    autocomplete_fields = ("terreno", "buyer")
