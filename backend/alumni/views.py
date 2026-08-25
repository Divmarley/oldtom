from rest_framework import viewsets, filters, status
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import AllowAny, IsAdminUser, IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth.models import User
from django.utils import timezone
from .auth_serializers import EmailTokenObtainPairSerializer
from .emails import schedule_event_registration_email, schedule_welcome_email
from .models import Alumni, Event, ContactMessage, YearbookEntry, EventRegistration, Donation, Project
from .serializers import (
    UserSerializer,
    AlumniSerializer, 
    EventSerializer, 
    ContactMessageSerializer, 
    YearbookEntrySerializer,
    EventRegistrationSerializer,
    DonationSerializer,
    ProjectSerializer
)
from .serializers import ProductSerializer, OrderSerializer, ShippingOptionSerializer
from .models import Product, Order, ShippingOption
from django.db import IntegrityError, transaction
from decimal import Decimal
from .permissions import (
    IsAdminOrCreate,
    IsAdminOrReadOnly,
    IsAdminOrReadOnlyOrCreate,
    IsOrderOwnerOrAdminOrCreate,
    IsOwnerOrAdmin,
    IsSelfOrAdmin,
)

class RegisterUserView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'account_registration'

    def post(self, request):
        serializer = UserSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)

        try:
            with transaction.atomic():
                user = serializer.save()
                Alumni.objects.create(
                    user=user,
                    name=user.username,
                    email=user.email,
                )
                schedule_welcome_email(user.pk)
        except IntegrityError as exc:
            raise ValidationError(
                {
                    'detail': (
                        'Unable to create the account because the username or '
                        'email address already exists.'
                    )
                }
            ) from exc

        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)

@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def user_profile(request):
    try:
        alumni = request.user.alumni_profile
    except Alumni.DoesNotExist:
        return Response({"error": "Profile not found"}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = AlumniSerializer(alumni)
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        serializer = AlumniSerializer(alumni, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        print("serializer.errors",serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def current_user(request):
    if request.method == 'DELETE':
        request.user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    if request.method == 'GET':
        return Response(UserSerializer(request.user).data)

    serializer = UserSerializer(
        request.user,
        data=request.data,
        partial=True,
        context={'request': request},
    )
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(serializer.data)


class UserViewSet(viewsets.ModelViewSet):
    serializer_class = UserSerializer

    def get_queryset(self):
        queryset = User.objects.all().order_by('id')
        if self.request.user.is_staff:
            return queryset
        return queryset.filter(pk=self.request.user.pk)

    def get_permissions(self):
        if self.action == 'create':
            return [IsAdminUser()]
        return [IsAuthenticated(), IsSelfOrAdmin()]

class AlumniViewSet(viewsets.ModelViewSet):
    queryset = Alumni.objects.all().order_by('-created_at')
    serializer_class = AlumniSerializer
    permission_classes = [IsAdminOrReadOnlyOrCreate]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'profession', 'skills', 'category', 'location']

class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all().order_by('date')
    serializer_class = EventSerializer
    permission_classes = [IsAdminOrReadOnly]

class ContactMessageViewSet(viewsets.ModelViewSet):
    queryset = ContactMessage.objects.all().order_by('-created_at')
    serializer_class = ContactMessageSerializer
    permission_classes = [IsAdminOrCreate]

class YearbookEntryViewSet(viewsets.ModelViewSet):
    queryset = YearbookEntry.objects.all().order_by('-created_at')
    serializer_class = YearbookEntrySerializer
    permission_classes = [IsAdminOrReadOnlyOrCreate]

class EventRegistrationViewSet(viewsets.ModelViewSet):
    queryset = EventRegistration.objects.all().order_by('-registered_at')
    serializer_class = EventRegistrationSerializer
    permission_classes = [IsAdminOrCreate]
    throttle_scope = 'event_registration'

    def get_throttles(self):
        if self.action == 'create':
            return [ScopedRateThrottle()]
        return []

    def perform_create(self, serializer):
        try:
            with transaction.atomic():
                registration = serializer.save(
                    status=EventRegistration.Status.PENDING,
                    last_notified_status='',
                    notification_sent_at=None,
                )
                schedule_event_registration_email(registration.pk)
        except IntegrityError as exc:
            raise ValidationError(
                {'email': 'This email is already registered for this event.'}
            ) from exc

    def perform_update(self, serializer):
        previous_status = serializer.instance.status
        previous_email = serializer.instance.email
        previous_event_id = serializer.instance.event_id
        next_status = serializer.validated_data.get('status', previous_status)
        next_email = serializer.validated_data.get('email', previous_email)
        next_event = serializer.validated_data.get('event', serializer.instance.event)
        status_changed = next_status != previous_status
        recipient_changed = next_email != previous_email
        event_changed = next_event.pk != previous_event_id
        notification_changed = status_changed or recipient_changed or event_changed
        save_kwargs = {}

        if status_changed:
            save_kwargs['status_changed_at'] = timezone.now()

        if notification_changed:
            save_kwargs.update(
                last_notified_status='',
                notification_sent_at=None,
            )

        registration = serializer.save(**save_kwargs)
        if notification_changed or registration.last_notified_status != registration.status:
            schedule_event_registration_email(registration.pk)


class EmailTokenObtainPairView(TokenObtainPairView):
    serializer_class = EmailTokenObtainPairSerializer
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'login'

class DonationViewSet(viewsets.ModelViewSet):
    queryset = Donation.objects.all().order_by('-created_at')
    serializer_class = DonationSerializer
    permission_classes = [IsAdminOrCreate]

    def perform_create(self, serializer):
        serializer.save(status='pending')

    @staticmethod
    def _adjust_project_total(project, amount):
        if not project:
            return

        project.raised_amount = max(Decimal('0'), project.raised_amount + amount)
        project.save(update_fields=['raised_amount'])

    def perform_update(self, serializer):
        previous_project = serializer.instance.project
        previous_amount = serializer.instance.amount
        previous_status = serializer.instance.status
        donation = serializer.save()

        if previous_status == 'completed':
            self._adjust_project_total(previous_project, -previous_amount)

        if donation.status == 'completed':
            self._adjust_project_total(donation.project, donation.amount)

    def perform_destroy(self, instance):
        if instance.status == 'completed':
            self._adjust_project_total(instance.project, -instance.amount)
        instance.delete()

class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all().order_by('-created_at')
    serializer_class = ProjectSerializer
    permission_classes = [IsOwnerOrAdmin]
    owner_field = 'proposer'

    def perform_create(self, serializer):
        serializer.save(proposer=self.request.user)


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all().order_by('-created_at')
    serializer_class = ProductSerializer
    permission_classes = [IsAdminOrReadOnly]


class ShippingOptionViewSet(viewsets.ModelViewSet):
    queryset = ShippingOption.objects.all()
    serializer_class = ShippingOptionSerializer
    permission_classes = [IsAdminOrReadOnly]


class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all().order_by('-created_at')
    serializer_class = OrderSerializer
    permission_classes = [IsOrderOwnerOrAdminOrCreate]

    def get_queryset(self):
        queryset = Order.objects.all().order_by('-created_at')
        user = self.request.user

        if not user.is_authenticated:
            return queryset.none()

        if user.is_staff:
            return queryset

        return queryset.filter(user=user)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        with transaction.atomic():
            order = serializer.save()
        return Response(self.get_serializer(order).data, status=status.HTTP_201_CREATED)
