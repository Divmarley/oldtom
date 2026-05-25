from django.contrib import admin
from .models import Alumni, Event, ContactMessage

@admin.register(Alumni)
class AlumniAdmin(admin.ModelAdmin):
    list_display = ('name', 'profession', 'category', 'location', 'email')
    search_fields = ('name', 'profession', 'skills', 'category')
    list_filter = ('category', 'location')

@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ('title', 'date', 'location')
    search_fields = ('title', 'location')
    list_filter = ('date',)

@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'created_at')
    search_fields = ('name', 'email', 'message')
    readonly_fields = ('created_at',)
