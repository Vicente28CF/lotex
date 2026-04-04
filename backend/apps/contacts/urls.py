from rest_framework.routers import DefaultRouter

from .views import ContactRequestViewSet


router = DefaultRouter()
router.register("contact-requests", ContactRequestViewSet, basename="contact-requests")

urlpatterns = router.urls
