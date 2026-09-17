from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Incident, SOSReport, IncidentUpdate
from .serializers import IncidentSerializer, SOSReportSerializer, IncidentUpdateSerializer

class IncidentViewSet(viewsets.ModelViewSet):
    queryset = Incident.objects.all()
    serializer_class = IncidentSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['disaster_type', 'status', 'alert_level', 'state', 'district']
    search_fields = ['title', 'description', 'district', 'state']
    ordering_fields = ['created_at', 'priority_score', 'severity_score', 'incident_time']
    ordering = ['-created_at']

class SOSReportViewSet(viewsets.ModelViewSet):
    queryset = SOSReport.objects.all()
    serializer_class = SOSReportSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['severity', 'is_verified']
    search_fields = ['reporter_name', 'reporter_phone', 'address', 'description']
    ordering = ['-created_at']

    @action(detail=True, methods=['patch'], url_path='verify')
    def verify(self, request, pk=None):
        sos = self.get_object()
        sos.is_verified = True
        sos.save(update_fields=['is_verified'])
        return Response(SOSReportSerializer(sos).data, status=status.HTTP_200_OK)

class IncidentUpdateViewSet(viewsets.ModelViewSet):
    queryset = IncidentUpdate.objects.all()
    serializer_class = IncidentUpdateSerializer
    permission_classes = [permissions.AllowAny]
