from django.contrib import admin
from .models import Incident, SOSReport, IncidentUpdate

@admin.register(Incident)
class IncidentAdmin(admin.ModelAdmin):
    list_display = ('title', 'disaster_type', 'alert_level', 'status', 'state', 'district', 'affected_population', 'created_at')
    list_filter = ('alert_level', 'status', 'disaster_type', 'state')
    search_fields = ('title', 'district', 'state', 'description')
    ordering = ('-created_at',)

@admin.register(SOSReport)
class SOSReportAdmin(admin.ModelAdmin):
    list_display = ('id', 'reporter_name', 'reporter_phone', 'severity', 'people_trapped', 'is_verified', 'created_at')
    list_filter = ('severity', 'is_verified', 'created_at')
    search_fields = ('reporter_name', 'reporter_phone', 'address', 'description')
    ordering = ('-created_at',)

@admin.register(IncidentUpdate)
class IncidentUpdateAdmin(admin.ModelAdmin):
    list_display = ('id', 'incident', 'author', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('message',)
