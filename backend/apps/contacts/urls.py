from rest_framework_nested import routers

from .views import ContactRequestViewSet, MessageViewSet


router = routers.DefaultRouter()
router.register(r"contact-requests", ContactRequestViewSet, basename="contact-requests")

# Rutas anidadas: /contact-requests/{id}/messages/
contacts_router = routers.NestedDefaultRouter(router, r"contact-requests", lookup="contact")
contacts_router.register(r"messages", MessageViewSet, basename="contact-messages")

urlpatterns = router.urls + contacts_router.urls
