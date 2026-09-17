"""
Incidents app — SOS reports, disaster incidents, field updates.
"""

from django.db import models
from accounts.models import User, Agency


class Incident(models.Model):
    """A disaster incident — created by agency, AI, or public SOS."""

    DISASTER_TYPES = [
        ('flood', 'Flood'),
        ('earthquake', 'Earthquake'),
        ('cyclone', 'Cyclone'),
        ('wildfire', 'Wildfire'),
        ('landslide', 'Landslide'),
        ('drought', 'Drought'),
        ('tsunami', 'Tsunami'),
        ('heatwave', 'Heatwave'),
        ('industrial', 'Industrial Accident'),
        ('other', 'Other'),
    ]

    STATUS_CHOICES = [
        ('reported', 'Reported'),
        ('verified', 'Verified'),
        ('active', 'Active'),
        ('responding', 'Responding'),
        ('controlled', 'Controlled'),
        ('closed', 'Closed'),
    ]

    ALERT_LEVELS = [
        ('green', 'Green'),
        ('orange', 'Orange'),
        ('red', 'Red'),
    ]

    # Basic info
    title = models.CharField(max_length=255)
    description = models.TextField()
    disaster_type = models.CharField(max_length=30, choices=DISASTER_TYPES)
    disaster_subtype = models.CharField(max_length=100, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='reported')
    alert_level = models.CharField(max_length=10, choices=ALERT_LEVELS, default='orange')

    # Location
    latitude = models.FloatField()
    longitude = models.FloatField()
    state = models.CharField(max_length=100)
    district = models.CharField(max_length=100)
    address = models.TextField(blank=True)
    affected_area_km2 = models.FloatField(null=True, blank=True)

    # Impact
    affected_population = models.IntegerField(default=0)
    injured_count = models.IntegerField(default=0)
    missing_count = models.IntegerField(default=0)
    death_count = models.IntegerField(default=0)

    # AI scores
    severity_score = models.FloatField(null=True, blank=True)
    priority_score = models.FloatField(null=True, blank=True)
    risk_score = models.FloatField(null=True, blank=True)

    # Relations
    reported_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='reported_incidents')
    assigned_agency = models.ForeignKey(Agency, on_delete=models.SET_NULL, null=True, blank=True, related_name='incidents')

    # Timestamps
    incident_time = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    resolved_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-priority_score', '-created_at']

    def __str__(self):
        return f"[{self.alert_level.upper()}] {self.title} — {self.district}, {self.state}"


class SOSReport(models.Model):
    """Public SOS submission — victim or witness reports an emergency."""

    SEVERITY_CHOICES = [
        (1, 'Minor'),
        (2, 'Moderate'),
        (3, 'Serious'),
        (4, 'Critical'),
        (5, 'Life-Threatening'),
    ]

    # Reporter info (may be anonymous)
    reporter_name = models.CharField(max_length=100, blank=True)
    reporter_phone = models.CharField(max_length=15, blank=True)
    reporter_user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='sos_reports')

    # Situation
    description = models.TextField()
    people_trapped = models.IntegerField(default=0)
    severity = models.IntegerField(choices=SEVERITY_CHOICES, default=3)

    # Location (GPS from browser or manual)
    latitude = models.FloatField()
    longitude = models.FloatField()
    address = models.TextField(blank=True)
    landmark = models.CharField(max_length=255, blank=True)

    # Media evidence
    photo = models.ImageField(upload_to='sos_photos/', null=True, blank=True)
    video = models.FileField(upload_to='sos_videos/', null=True, blank=True)

    # Processing
    is_verified = models.BooleanField(default=False)
    linked_incident = models.ForeignKey(Incident, on_delete=models.SET_NULL, null=True, blank=True, related_name='sos_reports')
    ai_classification = models.JSONField(null=True, blank=True)  # Stores AI triage output

    # SMS confirmation
    sms_sent = models.BooleanField(default=False)
    sms_reference = models.CharField(max_length=50, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"SOS #{self.id} — Severity {self.severity} at ({self.latitude}, {self.longitude})"


class IncidentUpdate(models.Model):
    """Field update on an active incident."""
    incident = models.ForeignKey(Incident, on_delete=models.CASCADE, related_name='updates')
    author = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    message = models.TextField()
    photo = models.ImageField(upload_to='incident_updates/', null=True, blank=True)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Update on {self.incident.title} by {self.author}"
