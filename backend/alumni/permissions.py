from rest_framework.permissions import SAFE_METHODS, BasePermission


def is_admin(user):
    return bool(user and user.is_authenticated and user.is_staff)


class IsAdminOrReadOnly(BasePermission):
    """Allow public reads and limit every write to staff users."""

    def has_permission(self, request, view):
        return request.method in SAFE_METHODS or is_admin(request.user)


class IsAdminOrReadOnlyOrCreate(BasePermission):
    """Allow public reads/submissions and limit edits and deletes to staff."""

    def has_permission(self, request, view):
        return (
            request.method in SAFE_METHODS
            or request.method == 'POST'
            or is_admin(request.user)
        )


class IsAdminOrCreate(BasePermission):
    """Allow public submissions while keeping submitted data admin-managed."""

    def has_permission(self, request, view):
        return request.method == 'POST' or is_admin(request.user)


class IsOwnerOrAdmin(BasePermission):
    """Allow public reads, then restrict writes to an owner or a staff user."""

    def has_permission(self, request, view):
        return request.method in SAFE_METHODS or bool(
            request.user and request.user.is_authenticated
        )

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS or is_admin(request.user):
            return True

        owner = getattr(obj, getattr(view, 'owner_field', 'owner'), None)
        return owner == request.user


class IsOrderOwnerOrAdminOrCreate(BasePermission):
    """Allow guest checkout, while exposing existing orders only to their owner/admin."""

    def has_permission(self, request, view):
        if request.method == 'POST':
            return True

        return bool(request.user and request.user.is_authenticated)

    def has_object_permission(self, request, view, obj):
        return is_admin(request.user) or obj.user == request.user


class IsSelfOrAdmin(BasePermission):
    """Allow staff to manage all users and a user to manage only their account."""

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)

    def has_object_permission(self, request, view, obj):
        return is_admin(request.user) or obj == request.user
