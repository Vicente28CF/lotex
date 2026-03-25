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
        "created_at",
    )
    list_filter = ("status", "created_at")
    search_fields = (
        "buyer_name",
        "buyer_email",
        "buyer_phone",
        "terreno__title",
        "buyer__email",
        "buyer__full_name",
    )
    readonly_fields = ("id", "created_at")
    autocomplete_fields = ("terreno", "buyer")
