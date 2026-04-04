from rest_framework.routers import DefaultRouter

from .views import TerrenoViewSet


router = DefaultRouter()
router.register("terrenos", TerrenoViewSet, basename="terrenos")

urlpatterns = router.urls
