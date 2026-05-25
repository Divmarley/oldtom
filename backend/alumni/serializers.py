from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Alumni, Event, ContactMessage, YearbookEntry, EventRegistration, Donation, Project

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password', 'is_staff')

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password']
        )
        return user

class AlumniSerializer(serializers.ModelSerializer):
    user_details = UserSerializer(source='user', read_only=True)
    class Meta:
        model = Alumni
        fields = '__all__'

class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = '__all__'

class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = '__all__'

class YearbookEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = YearbookEntry
        fields = '__all__'

class EventRegistrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventRegistration
        fields = '__all__'

class DonationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Donation
        fields = '__all__'

class ProjectSerializer(serializers.ModelSerializer):
    proposer_details = UserSerializer(source='proposer', read_only=True)
    class Meta:
        model = Project
        fields = '__all__'
        read_only_fields = ('proposer', 'raised_amount')
