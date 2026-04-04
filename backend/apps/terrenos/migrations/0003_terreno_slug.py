from django.db import migrations, models
from django.utils.text import slugify


def generate_unique_slug(title, used_slugs, fallback):
    base_slug = slugify(title)[:200] or fallback
    slug = base_slug
    suffix = 1
    while slug in used_slugs:
        slug = f"{base_slug[:195]}-{suffix}"
        suffix += 1
    used_slugs.add(slug)
    return slug


def populate_slugs(apps, schema_editor):
    Terreno = apps.get_model("terrenos", "Terreno")
    used_slugs = set(
        Terreno.objects.exclude(slug="").values_list("slug", flat=True)
    )

    for terreno in Terreno.objects.all().only("id", "title", "slug"):
        if terreno.slug:
            continue
        terreno.slug = generate_unique_slug(terreno.title, used_slugs, str(terreno.id))
        terreno.save(update_fields=["slug"])


class Migration(migrations.Migration):

    dependencies = [
        ("terrenos", "0002_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="terreno",
            name="slug",
            field=models.CharField(blank=True, default="", max_length=220),
            preserve_default=False,
        ),
        migrations.RunPython(populate_slugs, migrations.RunPython.noop),
        migrations.AlterField(
            model_name="terreno",
            name="slug",
            field=models.SlugField(editable=False, max_length=220, unique=True),
        ),
    ]
