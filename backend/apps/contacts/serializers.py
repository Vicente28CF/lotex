from rest_framework import serializers

from apps.terrenos.models import Terreno

from .models import ContactRequest


class ContactRequestCreateSerializer(serializers.ModelSerializer):
    terreno_slug = serializers.SlugRelatedField(
        source="terreno",
        slug_field="slug",
        queryset=Terreno.objects.filter(status=Terreno.Status.ACTIVE),
    )

    class Meta:
        model = ContactRequest
        fields = ("terreno_slug", "buyer_name", "buyer_email", "buyer_phone", "message")
        extra_kwargs = {
            "buyer_name": {"required": False},
            "buyer_email": {"required": False},
            "buyer_phone": {"required": False},
        }

    def validate_message(self, value):
        clean_value = value.strip()
        if len(clean_value) < 20:
            raise serializers.ValidationError("El mensaje debe tener al menos 20 caracteres.")
        return clean_value

    def validate(self, attrs):
        request = self.context["request"]
        terreno = attrs["terreno"]

        if terreno.user_id == request.user.id:
            raise serializers.ValidationError("No puedes contactar por un terreno propio.")

        attrs["buyer_name"] = attrs.get("buyer_name") or request.user.full_name
        attrs["buyer_email"] = attrs.get("buyer_email") or request.user.email
        attrs["buyer_phone"] = attrs.get("buyer_phone") or request.user.phone
        return attrs

    def create(self, validated_data):
        request = self.context["request"]
        return ContactRequest.objects.create(buyer=request.user, **validated_data)


class ContactRequestListSerializer(serializers.ModelSerializer):
    terreno = serializers.SerializerMethodField()

    class Meta:
        model = ContactRequest
        fields = (
            "id",
            "terreno",
            "buyer_name",
            "buyer_email",
            "buyer_phone",
            "message",
            "status",
            "notification_status",
            "notification_sent_at",
            "notification_error",
            "created_at",
        )

    def get_terreno(self, obj):
        return {
            "title": obj.terreno.title,
            "slug": obj.terreno.slug,
        }


class ContactRequestStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactRequest
        fields = ("status",)
