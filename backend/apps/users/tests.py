from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from .models import User


class AuthApiTests(APITestCase):
    def test_register_returns_tokens_and_user(self):
        response = self.client.post(
            reverse("auth-register"),
            {
                "email": "nuevo@test.com",
                "full_name": "Nuevo Usuario",
                "phone": "3312345678",
                "password": "LoteXPassSegura28",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn("tokens", response.data)
        self.assertIn("user", response.data)
        self.assertTrue(User.objects.filter(email="nuevo@test.com").exists())

    def test_login_returns_tokens(self):
        user = User.objects.create_user(
            email="login@test.com",
            full_name="Login User",
            password="LoteXPassSegura28",
        )

        response = self.client.post(
            reverse("auth-login"),
            {
                "email": user.email,
                "password": "LoteXPassSegura28",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data["tokens"])

    def test_me_requires_authentication(self):
        response = self.client.get(reverse("users-me"))
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

# Create your tests here.
