from django.db import models
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError

class Alumni(models.Model):
    PROFILE_REQUIRED_FIELDS = (
        ('name', 'full name'),
        ('email', 'email address'),
        ('profession', 'profession'),
        ('location', 'location'),
        ('bio', 'short bio'),
    )

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='alumni_profile', null=True, blank=True)
    CATEGORY_CHOICES = [
        ('Tech', 'Tech'),
        ('Business', 'Business'),
        ('Health', 'Health'),
        ('Engineering', 'Engineering'),
        ('Arts', 'Arts'),
        ('Education', 'Education'),
        ('Other', 'Other'),
    ]

    name = models.CharField(max_length=255)
    photo = models.ImageField(upload_to='alumni_photos/', null=True, blank=True)
    profession = models.CharField(max_length=255)
    company = models.CharField(max_length=255, null=True, blank=True)
    location = models.CharField(max_length=255)
    bio = models.TextField()
    skills = models.CharField(max_length=500, help_text="Comma separated skills", null=True, blank=True)
    linkedin = models.URLField(max_length=500, null=True, blank=True)
    facebook = models.URLField(max_length=500, null=True, blank=True)
    instagram = models.URLField(max_length=500, null=True, blank=True)
    twitter = models.URLField(max_length=500, null=True, blank=True)
    portfolio_url = models.URLField(max_length=500, null=True, blank=True, help_text="Link to art/work portfolio")
    art_work_description = models.TextField(null=True, blank=True, help_text="Description of your art or creative work")
    email = models.EmailField(unique=True)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='Other')
    has_edit_request = models.BooleanField(default=False)
    edit_request_notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

    @property
    def missing_profile_fields(self):
        return [
            field_name
            for field_name, _label in self.PROFILE_REQUIRED_FIELDS
            if not str(getattr(self, field_name, '') or '').strip()
        ]

    @property
    def profile_complete(self):
        return not self.missing_profile_fields

    @property
    def profile_completion_percentage(self):
        completed = len(self.PROFILE_REQUIRED_FIELDS) - len(
            self.missing_profile_fields
        )
        return round(completed / len(self.PROFILE_REQUIRED_FIELDS) * 100)

class Event(models.Model):
    title = models.CharField(max_length=255)
    date = models.DateTimeField()
    location = models.CharField(max_length=255)
    description = models.TextField()
    image = models.ImageField(upload_to='event_images/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

class ContactMessage(models.Model):
    name = models.CharField(max_length=255)
    email = models.EmailField()
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Message from {self.name}"

class YearbookEntry(models.Model):
    alumni = models.ForeignKey(Alumni, on_delete=models.CASCADE, related_name='yearbook_entries', null=True, blank=True)
    name = models.CharField(max_length=255, help_text="Name for guest signatures")
    message = models.TextField(help_text="A short message or signature")
    image = models.ImageField(upload_to='yearbook_images/', null=True, blank=True)
    is_badge = models.BooleanField(default=False, help_text="Set to true if this is a class badge/photo")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "Yearbook Entries"

    def __str__(self):
        return f"Entry by {self.name or (self.alumni.name if self.alumni else 'Unknown')}"

class EventRegistration(models.Model):
    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending review'
        APPROVED = 'approved', 'Approved'
        REJECTED = 'rejected', 'Rejected'
        CANCELLED = 'cancelled', 'Cancelled'

    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='registrations')
    name = models.CharField(max_length=255)
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    alumni_id = models.CharField(max_length=50, blank=True, null=True, help_text="Optional Alumni ID if applicable")
    notes = models.TextField(blank=True, null=True)
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
        db_index=True,
    )
    status_changed_at = models.DateTimeField(auto_now_add=True)
    last_notified_status = models.CharField(max_length=20, blank=True, default='')
    notification_sent_at = models.DateTimeField(null=True, blank=True)
    registered_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=('event', 'email'),
                name='unique_event_registration_email',
            ),
        ]

    def __str__(self):
        return f"{self.name} - {self.event.title}"

    def save(self, *args, **kwargs):
        self.email = self.email.strip().lower()
        return super().save(*args, **kwargs)

    def clean(self):
        super().clean()
        self.email = self.email.strip().lower()
        duplicate = EventRegistration.objects.filter(
            event_id=self.event_id,
            email__iexact=self.email,
        ).exclude(pk=self.pk)
        if self.event_id and self.email and duplicate.exists():
            raise ValidationError(
                {'email': 'This email is already registered for this event.'}
            )

class Donation(models.Model):
    PAYMENT_METHOD_CHOICES = [
        ('momo', 'Mobile Money'),
        ('card', 'Credit/Debit Card'),
    ]
    
    project = models.ForeignKey('Project', on_delete=models.SET_NULL, null=True, blank=True, related_name='donations')
    name = models.CharField(max_length=255)
    email = models.EmailField()
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES)
    phone = models.CharField(max_length=20, blank=True, null=True)
    transaction_id = models.CharField(max_length=100, unique=True, blank=True, null=True)
    status = models.CharField(max_length=20, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - {self.amount} ({self.payment_method})"

class Project(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    image = models.ImageField(upload_to='project_images/', null=True, blank=True)
    status = models.CharField(max_length=50, choices=[('Active', 'Active'), ('Upcoming', 'Upcoming'), ('Ongoing', 'Ongoing'), ('Completed', 'Completed')], default='Active')
    proposer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='proposed_projects', null=True, blank=True)
    goal_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    raised_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


class Product(models.Model):
    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True)
    description = models.TextField(blank=True, null=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    image = models.ImageField(upload_to='product_images/', null=True, blank=True)
    stock = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


class ShippingOption(models.Model):
    name = models.CharField(max_length=255)
    price = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    is_pickup = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.name} ({'Pickup' if self.is_pickup else 'Delivery'})"


class Order(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]

    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    full_name = models.CharField(max_length=255)
    email = models.EmailField()
    phone = models.CharField(max_length=50, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    shipping_option = models.ForeignKey(ShippingOption, on_delete=models.SET_NULL, null=True, blank=True)
    total = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Order #{self.id} - {self.full_name}"


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True)
    quantity = models.PositiveIntegerField(default=1)
    price = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.quantity} x {self.product.title if self.product else 'Unknown'}"
