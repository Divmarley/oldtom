from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    AlumniViewSet, 
    EventViewSet, 
    ContactMessageViewSet, 
    YearbookEntryViewSet,
    EventRegistrationViewSet,
    DonationViewSet,
    ProjectViewSet,
    RegisterUserView,
    user_profile,
    current_user,
    UserViewSet,
    EmailTokenObtainPairView,
)
from .views import ProductViewSet, OrderViewSet, ShippingOptionViewSet

router = DefaultRouter()
router.register(r'alumni', AlumniViewSet)
router.register(r'events', EventViewSet)
router.register(r'contact', ContactMessageViewSet)
router.register(r'yearbook', YearbookEntryViewSet)
router.register(r'event-registration', EventRegistrationViewSet)
router.register(r'donations', DonationViewSet)
router.register(r'projects', ProjectViewSet)
router.register(r'products', ProductViewSet)
router.register(r'orders', OrderViewSet)
router.register(r'shipping-options', ShippingOptionViewSet)
router.register(r'users', UserViewSet, basename='user')

urlpatterns = [
    path('', include(router.urls)),
    path('auth/register/', RegisterUserView.as_view(), name='register'),
    path('auth/login/', EmailTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/profile/', user_profile, name='profile'),
    path('auth/me/', current_user, name='current_user'),
]
