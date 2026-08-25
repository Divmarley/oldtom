from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .emails import send_login_notification


class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        send_login_notification(self.user, self.context.get('request'))
        return data
