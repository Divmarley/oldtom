from django.db import models
from django.contrib.auth.models import User

class Alumni(models.Model):
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
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='registrations')
    name = models.CharField(max_length=255)
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    alumni_id = models.CharField(max_length=50, blank=True, null=True, help_text="Optional Alumni ID if applicable")
    notes = models.TextField(blank=True, null=True)
    registered_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - {self.event.title}"

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
