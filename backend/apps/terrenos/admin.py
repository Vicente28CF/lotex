from django.contrib import admin

from .models import Terreno, TerrenoImage


class TerrenoImageInline(admin.TabularInline):
    model = TerrenoImage
    extra = 0
    fields = ("cloudinary_url", "cloudinary_id", "order", "is_cover", "created_at")
    readonly_fields = ("created_at",)


@admin.register(Terreno)
class TerrenoAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "user",
        "municipio",
        "estado",
        "price",
        "area_m2",
        "status",
        "is_featured",
        "views_count",
        "created_at",
    )
    list_filter = ("status", "is_featured", "estado", "municipio")
    search_fields = ("title", "description", "municipio", "estado", "user__email", "user__full_name")
    readonly_fields = ("id", "views_count", "created_at", "updated_at")
    autocomplete_fields = ("user",)
    inlines = (TerrenoImageInline,)


@admin.register(TerrenoImage)
class TerrenoImageAdmin(admin.ModelAdmin):
    list_display = ("terreno", "order", "is_cover", "created_at")
    list_filter = ("is_cover", "created_at")
    search_fields = ("terreno__title", "cloudinary_id", "cloudinary_url")
    readonly_fields = ("id", "created_at")
    autocomplete_fields = ("terreno",)
