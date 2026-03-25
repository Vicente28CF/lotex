from rest_framework.permissions import SAFE_METHODS, BasePermission


class IsOwnerOrReadOnly(BasePermission):
    """
    Allow read-only access to anyone and write access only to the object owner.
    Expects the model instance to expose a `user` attribute.
    """

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        return request.user.is_authenticated and obj.user_id == request.user.id


class IsAgentOrAdmin(BasePermission):
    """Allow access only to agents or platform admins."""

    def has_permission(self, request, view):
        user = request.user
        return (
            user.is_authenticated
            and (getattr(user, "is_agent", False) or getattr(user, "is_admin_user", False))
        )


class IsAdminUser(BasePermission):
    """Allow access only to project admins."""

    def has_permission(self, request, view):
        user = request.user
        return user.is_authenticated and getattr(user, "is_admin_user", False)
