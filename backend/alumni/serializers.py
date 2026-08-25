from rest_framework import serializers
from rest_framework.fields import empty
from decimal import Decimal
from django.contrib.auth.models import User
from django.db import transaction
from django.utils.text import slugify
from .models import Alumni, Event, ContactMessage, YearbookEntry, EventRegistration, Donation, Project
from .models import Product, Order, OrderItem, ShippingOption

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False)
    email = serializers.EmailField(required=True)
    is_staff = serializers.BooleanField(read_only=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password', 'is_staff')

    def get_fields(self):
        fields = super().get_fields()
        request = self.context.get('request')

        if request and request.user.is_authenticated and request.user.is_staff:
            fields['is_staff'].read_only = False

        return fields

    def validate(self, attrs):
        if self.instance is None and not attrs.get('password'):
            raise serializers.ValidationError({'password': 'This field is required.'})

        return attrs

    def validate_email(self, value):
        normalized_email = value.strip().lower()
        duplicate_user = User.objects.filter(email__iexact=normalized_email).exclude(
            pk=getattr(self.instance, 'pk', None)
        )
        duplicate_profile = Alumni.objects.filter(email__iexact=normalized_email)
        if self.instance is not None:
            duplicate_profile = duplicate_profile.exclude(user=self.instance)

        if duplicate_user.exists() or duplicate_profile.exists():
            raise serializers.ValidationError(
                'An account with this email address already exists.'
            )
        return normalized_email

    def create(self, validated_data):
        is_staff = validated_data.pop('is_staff', False)
        user = User.objects.create_user(**validated_data)

        if is_staff:
            user.is_staff = True
            user.save(update_fields=['is_staff'])

        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', empty)
        is_staff = validated_data.pop('is_staff', empty)
        email_changed = 'email' in validated_data

        with transaction.atomic():
            for attr, value in validated_data.items():
                setattr(instance, attr, value)

            if password is not empty:
                instance.set_password(password)

            request = self.context.get('request')
            if (
                is_staff is not empty
                and request
                and request.user.is_authenticated
                and request.user.is_staff
            ):
                instance.is_staff = is_staff

            instance.save()
            profile = getattr(instance, 'alumni_profile', None)
            if email_changed and profile and profile.email != instance.email:
                profile.email = instance.email
                profile.save(update_fields=['email'])
        return instance

class AlumniSerializer(serializers.ModelSerializer):
    user_details = UserSerializer(source='user', read_only=True)
    profile_complete = serializers.BooleanField(read_only=True)
    profile_completion_percentage = serializers.IntegerField(read_only=True)
    missing_profile_fields = serializers.ListField(
        child=serializers.CharField(),
        read_only=True,
    )

    class Meta:
        model = Alumni
        fields = '__all__'
        read_only_fields = ('user',)

    def validate_email(self, value):
        normalized_email = value.strip().lower()
        duplicate_profile = Alumni.objects.filter(
            email__iexact=normalized_email
        ).exclude(pk=getattr(self.instance, 'pk', None))
        duplicate_user = User.objects.filter(email__iexact=normalized_email)
        if self.instance and self.instance.user_id:
            duplicate_user = duplicate_user.exclude(pk=self.instance.user_id)

        if duplicate_profile.exists() or duplicate_user.exists():
            raise serializers.ValidationError(
                'An account with this email address already exists.'
            )
        return normalized_email

    def update(self, instance, validated_data):
        email_changed = 'email' in validated_data
        with transaction.atomic():
            instance = super().update(instance, validated_data)
            if (
                email_changed
                and instance.user_id
                and instance.user.email != instance.email
            ):
                instance.user.email = instance.email
                instance.user.save(update_fields=['email'])
        return instance

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
        read_only_fields = ('alumni', 'is_badge')

class EventRegistrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventRegistration
        fields = '__all__'
        read_only_fields = (
            'registered_at',
            'updated_at',
            'status_changed_at',
            'last_notified_status',
            'notification_sent_at',
        )

    def validate_email(self, value):
        return value.strip().lower()

    def validate(self, attrs):
        event = attrs.get('event') or getattr(self.instance, 'event', None)
        email = attrs.get('email') or getattr(self.instance, 'email', '')
        duplicate = EventRegistration.objects.filter(
            event=event,
            email__iexact=email,
        ).exclude(pk=getattr(self.instance, 'pk', None))

        if event and email and duplicate.exists():
            raise serializers.ValidationError(
                {'email': 'This email is already registered for this event.'}
            )
        return attrs

class DonationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Donation
        fields = '__all__'
        read_only_fields = ('status', 'transaction_id', 'created_at')

class ProjectSerializer(serializers.ModelSerializer):
    proposer_details = UserSerializer(source='proposer', read_only=True)
    class Meta:
        model = Project
        fields = '__all__'
        read_only_fields = ('proposer', 'raised_amount')


class ProductSerializer(serializers.ModelSerializer):
    slug = serializers.SlugField(required=False, allow_blank=True)

    class Meta:
        model = Product
        fields = '__all__'

    def _generate_unique_slug(self, base_slug):
        candidate = slugify(base_slug) or 'product'
        original_candidate = candidate
        counter = 2

        while Product.objects.filter(slug=candidate).exclude(pk=getattr(self.instance, 'pk', None)).exists():
            candidate = f'{original_candidate}-{counter}'
            counter += 1

        return candidate

    def validate(self, attrs):
        title = attrs.get('title') or getattr(self.instance, 'title', None)
        submitted_slug = attrs.get('slug')

        if title and (not submitted_slug or not submitted_slug.strip()):
            attrs['slug'] = self._generate_unique_slug(title)
        elif submitted_slug and submitted_slug.strip():
            attrs['slug'] = self._generate_unique_slug(submitted_slug)

        return attrs


class OrderItemSerializer(serializers.ModelSerializer):
    product_details = ProductSerializer(source='product', read_only=True)

    class Meta:
        model = OrderItem
        fields = ('id', 'product', 'product_details', 'quantity', 'price')


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True)

    class Meta:
        model = Order
        fields = ('id', 'user', 'full_name', 'email', 'phone', 'address', 'shipping_option', 'total', 'status', 'created_at', 'items')
        read_only_fields = ('status', 'created_at', 'total', 'user')

    def create(self, validated_data):
        items_data = validated_data.pop('items', [])
        request = self.context.get('request')
        user = request.user if request and request.user and request.user.is_authenticated else None
        order = Order.objects.create(user=user, **validated_data)
        total = Decimal('0')
        for item in items_data:
            product = item.get('product')
            qty = int(item.get('quantity', 1))

            if not product:
                raise serializers.ValidationError({'items': 'Each item needs a product.'})

            if product.stock < qty:
                raise serializers.ValidationError(
                    {'items': f'Only {product.stock} units of {product.title} are available.'}
                )

            price = product.price
            OrderItem.objects.create(order=order, product=product, quantity=qty, price=price)
            total += price * qty
            product.stock -= qty
            product.save(update_fields=['stock'])

        order.total = total
        order.save()
        return order


class ShippingOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShippingOption
        fields = '__all__'
