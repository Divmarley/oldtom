from rest_framework import viewsets, filters, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.contrib.auth.models import User
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

@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        # Automatically create an alumni profile for the new user
        Alumni.objects.create(
            user=user,
            name=user.username,
            email=user.email or f"{user.username}@example.com"
        )
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

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

class AlumniViewSet(viewsets.ModelViewSet):
    queryset = Alumni.objects.all().order_by('-created_at')
    serializer_class = AlumniSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'profession', 'skills', 'category', 'location']

class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all().order_by('date')
    serializer_class = EventSerializer

class ContactMessageViewSet(viewsets.ModelViewSet):
    queryset = ContactMessage.objects.all().order_by('-created_at')
    serializer_class = ContactMessageSerializer

class YearbookEntryViewSet(viewsets.ModelViewSet):
    queryset = YearbookEntry.objects.all().order_by('-created_at')
    serializer_class = YearbookEntrySerializer

class EventRegistrationViewSet(viewsets.ModelViewSet):
    queryset = EventRegistration.objects.all().order_by('-registered_at')
    serializer_class = EventRegistrationSerializer

class DonationViewSet(viewsets.ModelViewSet):
    queryset = Donation.objects.all().order_by('-created_at')
    serializer_class = DonationSerializer

    def perform_create(self, serializer):
        donation = serializer.save()
        # If donation is successful (simulated), update project raised amount
        if donation.project:
            project = donation.project
            project.raised_amount += donation.amount
            project.save()

class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all().order_by('-created_at')
    serializer_class = ProjectSerializer

    def perform_create(self, serializer):
        if self.request.user.is_authenticated:
            serializer.save(proposer=self.request.user)
        else:
            serializer.save()
