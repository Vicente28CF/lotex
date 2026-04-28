from django.urls import path

from .google_auth import GoogleAuthView
from .views import (
    LoginView,
    LogoutView,
    RegisterView,
    ResendVerificationView,
    UserMeView,
    VerifyEmailView,
)


urlpatterns = [
    path("auth/register/", RegisterView.as_view(), name="auth-register"),
    path("auth/login/", LoginView.as_view(), name="auth-login"),
    path("auth/google/", GoogleAuthView.as_view(), name="auth-google"),
    path("auth/logout/", LogoutView.as_view(), name="auth-logout"),
    path("auth/verify-email/", VerifyEmailView.as_view(), name="auth-verify-email"),
    path("auth/resend-verification/", ResendVerificationView.as_view(), name="auth-resend-verification"),
    path("users/me/", UserMeView.as_view(), name="users-me"),
]
