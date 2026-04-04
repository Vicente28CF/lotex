from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from .models import User


class UserSerializer(serializers.ModelSerializer):
    can_publish = serializers.BooleanField(read_only=True)

    class Meta:
        model = User
        fields = (
            "id",
            "email",
            "full_name",
            "phone",
            "role",
            "is_verified",
            "can_publish",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "email", "role", "is_verified", "created_at", "updated_at")


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8, style={"input_type": "password"})

    class Meta:
        model = User
        fields = ("email", "full_name", "phone", "password")

    def validate_email(self, value):
        email = User.objects.normalize_email(value)
        if User.objects.filter(email=email).exists():
            raise serializers.ValidationError("Ya existe una cuenta con este email.")
        return email

    def validate_password(self, value):
        validate_password(value)
        return value

    def create(self, validated_data):
        password = validated_data.pop("password")
        return User.objects.create_user(password=password, **validated_data)


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, style={"input_type": "password"})

    def validate(self, attrs):
        email = User.objects.normalize_email(attrs["email"])
        password = attrs["password"]
        user = authenticate(
            request=self.context.get("request"),
            email=email,
            password=password,
        )
        if not user:
            raise serializers.ValidationError("Credenciales invalidas.")
        if not user.is_active:
            raise serializers.ValidationError("Esta cuenta esta desactivada.")
        attrs["user"] = user
        return attrs


class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("full_name", "phone")

