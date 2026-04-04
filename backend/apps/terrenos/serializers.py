from django.db import transaction
from rest_framework import serializers

from .models import Terreno, TerrenoImage


class TerrenoImageSerializer(serializers.ModelSerializer):
    image_url = serializers.URLField(source="cloudinary_url", read_only=True)

    class Meta:
        model = TerrenoImage
        fields = ("id", "image_url", "order", "is_cover")


class TerrenoListSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()
    short_description = serializers.SerializerMethodField()

    class Meta:
        model = Terreno
        fields = (
            "id",
            "slug",
            "title",
            "short_description",
            "municipio",
            "estado",
            "area_m2",
            "price",
            "status",
            "is_featured",
            "image",
        )

    def get_image(self, obj):
        cover = next((image for image in obj.images.all() if image.is_cover), None)
        if cover:
            return cover.cloudinary_url
        first = next(iter(obj.images.all()), None)
        return first.cloudinary_url if first else None

    def get_short_description(self, obj):
        return obj.description[:140].strip()


class TerrenoDetailSerializer(serializers.ModelSerializer):
    images = TerrenoImageSerializer(many=True, read_only=True)
    owner = serializers.SerializerMethodField()

    class Meta:
        model = Terreno
        fields = (
            "id",
            "slug",
            "title",
            "description",
            "price",
            "area_m2",
            "municipio",
            "estado",
            "address",
            "latitude",
            "longitude",
            "status",
            "is_featured",
            "views_count",
            "images",
            "owner",
            "created_at",
            "updated_at",
        )

    def get_owner(self, obj):
        return {
            "full_name": obj.user.full_name,
            "is_verified": obj.user.is_verified,
        }


class TerrenoWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Terreno
        fields = (
            "title",
            "description",
            "price",
            "area_m2",
            "municipio",
            "estado",
            "address",
            "latitude",
            "longitude",
            "status",
            "is_featured",
        )
        read_only_fields = ("is_featured",)

    def validate_price(self, value):
        if value <= 0:
            raise serializers.ValidationError("El precio debe ser mayor a cero.")
        return value

    def validate_area_m2(self, value):
        if value <= 0:
            raise serializers.ValidationError("El area debe ser mayor a cero.")
        return value

    def validate(self, attrs):
        latitude = attrs.get("latitude", getattr(self.instance, "latitude", None))
        longitude = attrs.get("longitude", getattr(self.instance, "longitude", None))

        if (latitude is None) ^ (longitude is None):
            raise serializers.ValidationError(
                "Latitude y longitude deben enviarse juntas o omitirse ambas."
            )

        if latitude is not None and not (-90 <= latitude <= 90):
            raise serializers.ValidationError({"latitude": "Latitud fuera de rango."})

        if longitude is not None and not (-180 <= longitude <= 180):
            raise serializers.ValidationError({"longitude": "Longitud fuera de rango."})

        return attrs


class TerrenoStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Terreno
        fields = ("status",)


class TerrenoImageWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = TerrenoImage
        fields = ("cloudinary_url", "cloudinary_id", "order", "is_cover")

    def validate_cloudinary_url(self, value):
        if not value.startswith("https://"):
            raise serializers.ValidationError("La URL de imagen debe usar HTTPS.")
        return value


class TerrenoImageBulkSerializer(serializers.Serializer):
    images = TerrenoImageWriteSerializer(many=True)

    def validate_images(self, value):
        if not value:
            raise serializers.ValidationError("Debes enviar al menos una imagen.")
        if len(value) > 10:
            raise serializers.ValidationError("No puedes registrar mas de 10 imagenes por terreno.")
        covers = sum(1 for image in value if image.get("is_cover"))
        if covers > 1:
            raise serializers.ValidationError("Solo puede existir una imagen portada.")
        return value

    @transaction.atomic
    def save(self, terreno):
        TerrenoImage.objects.filter(terreno=terreno).delete()
        images = [
            TerrenoImage(terreno=terreno, **image_data)
            for image_data in self.validated_data["images"]
        ]
        return TerrenoImage.objects.bulk_create(images)


class TerrenoImageUpdateItemSerializer(serializers.Serializer):
    id = serializers.UUIDField()
    order = serializers.IntegerField(min_value=0)
    is_cover = serializers.BooleanField()


class TerrenoImageManageSerializer(serializers.Serializer):
    images = TerrenoImageUpdateItemSerializer(many=True)

    def validate_images(self, value):
        if not value:
            raise serializers.ValidationError("Debes conservar al menos una imagen.")

        ids = [str(image["id"]) for image in value]
        if len(ids) != len(set(ids)):
            raise serializers.ValidationError("No puedes repetir imagenes en la galeria.")

        orders = [image["order"] for image in value]
        if len(orders) != len(set(orders)):
            raise serializers.ValidationError("Cada imagen debe tener un orden unico.")

        covers = sum(1 for image in value if image.get("is_cover"))
        if covers != 1:
            raise serializers.ValidationError("Debes seleccionar exactamente una imagen portada.")

        return value

    def validate(self, attrs):
        terreno = self.context["terreno"]
        existing_ids = set(terreno.images.values_list("id", flat=True))
        incoming_ids = {image["id"] for image in attrs["images"]}

        if existing_ids != incoming_ids:
            raise serializers.ValidationError(
                {"images": "Debes enviar todas las imagenes actuales para reordenar la galeria."}
            )

        return attrs

    @transaction.atomic
    def save(self, terreno):
        image_map = {image.id: image for image in terreno.images.all()}
        updated_images = []

        for image_data in self.validated_data["images"]:
            image = image_map[image_data["id"]]
            image.order = image_data["order"]
            image.is_cover = image_data["is_cover"]
            updated_images.append(image)

        TerrenoImage.objects.bulk_update(updated_images, ["order", "is_cover"])
        return updated_images


class TerrenoImageDeleteSerializer(serializers.Serializer):
    image_id = serializers.UUIDField()

    def validate_image_id(self, value):
        terreno = self.context["terreno"]
        if not terreno.images.filter(id=value).exists():
            raise serializers.ValidationError("La imagen indicada no pertenece a este terreno.")
        return value
