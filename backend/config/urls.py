from django.contrib import admin
from django.urls import include, path

from apps.users.views import RefreshView

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("apps.users.urls")),
    path("api/auth/token/refresh/", RefreshView.as_view(), name="auth-token-refresh"),
]
