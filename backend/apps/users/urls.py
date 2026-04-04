from django.urls import path

from .views import LoginView, LogoutView, RegisterView, UserMeView


urlpatterns = [
    path("auth/register/", RegisterView.as_view(), name="auth-register"),
    path("auth/login/", LoginView.as_view(), name="auth-login"),
    path("auth/logout/", LogoutView.as_view(), name="auth-logout"),
    path("users/me/", UserMeView.as_view(), name="users-me"),
]
