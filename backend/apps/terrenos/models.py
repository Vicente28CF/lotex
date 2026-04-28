import uuid
from django.db import models
from django.conf import settings
from django.utils.text import slugify


class Terreno(models.Model):

    class Status(models.TextChoices):
        ACTIVE = "active", "Activo"
        SOLD   = "sold",   "Vendido"
        PAUSED = "paused", "Pausado"

    id          = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user        = models.ForeignKey(
                    settings.AUTH_USER_MODEL,
                    on_delete=models.CASCADE,
                    related_name="terrenos"
                  )
    slug        = models.SlugField(max_length=220, unique=True, editable=False)
    title       = models.CharField(max_length=200)
    description = models.TextField()
    price       = models.DecimalField(max_digits=14, decimal_places=2)
    area_m2     = models.DecimalField(max_digits=10, decimal_places=2)
    municipio   = models.CharField(max_length=100)
    estado      = models.CharField(max_length=100, default="Jalisco")
    nearby_services = models.JSONField(default=list, blank=True)
    terrain_type = models.CharField(max_length=20, blank=True)
    address     = models.CharField(max_length=255, blank=True)
    latitude    = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude   = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    status      = models.CharField(max_length=10, choices=Status.choices, default=Status.ACTIVE)
    is_featured = models.BooleanField(default=False)
    views_count = models.PositiveIntegerField(default=0)
    created_at  = models.DateTimeField(auto_now_add=True)
    updated_at  = models.DateTimeField(auto_now=True)

    class Meta:
        db_table            = "terrenos"
        verbose_name        = "Terreno"
        verbose_name_plural = "Terrenos"
        ordering            = ["-is_featured", "-created_at"]
        indexes = [
            models.Index(fields=["municipio"]),
            models.Index(fields=["status"]),
            models.Index(fields=["price"]),
            models.Index(fields=["is_featured", "-created_at"]),
        ]

    def __str__(self):
        return f"{self.title} — {self.municipio} (${self.price})"

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.title)[:200] or str(self.id)
            slug = base_slug
            suffix = 1
            while Terreno.objects.exclude(pk=self.pk).filter(slug=slug).exists():
                slug = f"{base_slug[:195]}-{suffix}"
                suffix += 1
            self.slug = slug
        super().save(*args, **kwargs)


class TerrenoImage(models.Model):

    id             = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    terreno        = models.ForeignKey(
                       Terreno,
                       on_delete=models.CASCADE,
                       related_name="images"
                     )
    cloudinary_url = models.URLField(max_length=500)
    cloudinary_id  = models.CharField(max_length=200)
    order          = models.PositiveSmallIntegerField(default=0)
    is_cover       = models.BooleanField(default=False)
    created_at     = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "terreno_images"
        ordering = ["order"]

    def __str__(self):
        return f"Imagen {self.order} de {self.terreno.title}"

class Favorite(models.Model):
    id         = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user       = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="favorites")
    terreno    = models.ForeignKey(Terreno, on_delete=models.CASCADE, related_name="favorited_by")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "terreno_favorites"
        unique_together = ("user", "terreno")
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user.email} favoritó {self.terreno.title}"
