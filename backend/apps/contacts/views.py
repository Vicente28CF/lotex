import logging

from django.db.models import Q
from rest_framework import mixins, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from core.throttling import ContactRateThrottle

from .models import ContactRequest
from .serializers import (
    ContactRequestCreateSerializer,
    ContactRequestListSerializer,
    ContactRequestStatusSerializer,
)
from .services import ContactNotificationServiceError, send_contact_request_notification


logger = logging.getLogger(__name__)


class ContactRequestViewSet(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.UpdateModelMixin,
    viewsets.GenericViewSet,
):
    http_method_names = ["get", "post", "patch"]

    def get_queryset(self):
        queryset = (
            ContactRequest.objects.select_related("terreno", "buyer", "terreno__user")
            .order_by("-created_at")
        )
        queryset = queryset.filter(terreno__user=self.request.user)

        status_filter = self.request.query_params.get("status")
        notification_filter = self.request.query_params.get("notification_status")
        search = self.request.query_params.get("search")

        if status_filter in {
            ContactRequest.Status.PENDING,
            ContactRequest.Status.READ,
            ContactRequest.Status.REPLIED,
        }:
            queryset = queryset.filter(status=status_filter)

        if notification_filter in {
            ContactRequest.NotificationStatus.PENDING,
            ContactRequest.NotificationStatus.SENT,
            ContactRequest.NotificationStatus.FAILED,
        }:
            queryset = queryset.filter(notification_status=notification_filter)

        if search:
            queryset = queryset.filter(
                Q(terreno__title__icontains=search)
                | Q(buyer_name__icontains=search)
                | Q(buyer_email__icontains=search)
                | Q(buyer_phone__icontains=search)
            )

        return queryset.distinct()

    def get_permissions(self):
        return [permissions.IsAuthenticated()]

    def get_throttles(self):
        if self.action == "create":
            return [ContactRateThrottle()]
        return super().get_throttles()

    def get_serializer_class(self):
        if self.action == "create":
            return ContactRequestCreateSerializer
        if self.action == "partial_update":
            return ContactRequestStatusSerializer
        return ContactRequestListSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        try:
            send_contact_request_notification(serializer.instance)
        except ContactNotificationServiceError:
            logger.warning(
                "La solicitud de contacto %s se creo, pero la notificacion quedo marcada como fallida.",
                serializer.instance.id,
            )
        except Exception:
            logger.exception(
                "Error inesperado al notificar solicitud de contacto %s.",
                serializer.instance.id,
            )
        data = ContactRequestListSerializer(serializer.instance, context=self.get_serializer_context()).data
        return Response(data, status=status.HTTP_201_CREATED)

    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(ContactRequestListSerializer(instance, context=self.get_serializer_context()).data)

    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated], url_path="resend-email")
    def resend_email(self, request, pk=None):
        instance = self.get_object()
        try:
            send_contact_request_notification(instance)
        except ContactNotificationServiceError:
            logger.warning(
                "El reenvio de notificacion para contacto %s termino en estado fallido.",
                instance.id,
            )
        except Exception:
            logger.exception(
                "Error inesperado al reenviar notificacion de contacto %s.",
                instance.id,
            )
        instance.refresh_from_db()
        return Response(ContactRequestListSerializer(instance, context=self.get_serializer_context()).data)
