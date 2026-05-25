from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from .views import (
    AlumniViewSet, 
    EventViewSet, 
    ContactMessageViewSet, 
    YearbookEntryViewSet,
    EventRegistrationViewSet,
    DonationViewSet,
    ProjectViewSet,
    register_user,
    user_profile
)

router = DefaultRouter()
router.register(r'alumni', AlumniViewSet)
router.register(r'events', EventViewSet)
router.register(r'contact', ContactMessageViewSet)
router.register(r'yearbook', YearbookEntryViewSet)
router.register(r'event-registration', EventRegistrationViewSet)
router.register(r'donations', DonationViewSet)
router.register(r'projects', ProjectViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('auth/register/', register_user, name='register'),
    path('auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/profile/', user_profile, name='profile'),
]
