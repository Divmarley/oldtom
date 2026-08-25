from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.authentication import JWTAuthentication


class OptionalJWTAuthentication(JWTAuthentication):
    """Treat a token for a deleted user as anonymous on public endpoints.

    Permissions still reject that request on protected endpoints, but public
    routes can continue instead of failing before their AllowAny/read-only
    permission is evaluated.
    """

    def authenticate(self, request):
        try:
            return super().authenticate(request)
        except AuthenticationFailed as exc:
            if isinstance(exc.detail, dict) and exc.detail.get('code') == 'user_not_found':
                return None
            raise
