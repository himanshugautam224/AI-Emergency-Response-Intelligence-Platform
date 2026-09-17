from rest_framework import serializers
from .models import Incident, SOSReport, IncidentUpdate
from accounts.serializers import UserSerializer, AgencySerializer

class IncidentSerializer(serializers.ModelSerializer):
    reported_by = UserSerializer(read_only=True)
    assigned_agency = AgencySerializer(read_only=True)

    class Meta:
        model = Incident
        fields = '__all__'

class IncidentUpdateSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)

    class Meta:
        model = IncidentUpdate
        fields = '__all__'

class SOSReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = SOSReport
        fields = '__all__'
