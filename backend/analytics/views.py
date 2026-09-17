"""Analytics API — aggregates from live incident data."""

from collections import Counter

from django.db.models import Count, Sum
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from incidents.models import Incident, SOSReport


class AnalyticsOverviewView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        incidents = Incident.objects.all()
        sos = SOSReport.objects.all()
        active = incidents.exclude(status__in=["closed", "controlled"]).count()
        red_alerts = incidents.filter(alert_level="red").count()
        affected = incidents.aggregate(total=Sum("affected_population"))["total"] or 0

        return Response({
            "active_incidents": active,
            "total_incidents": incidents.count(),
            "red_alerts": red_alerts,
            "people_affected": affected,
            "pending_sos": sos.filter(is_verified=False).count(),
            "verified_sos": sos.filter(is_verified=True).count(),
        })


class AnalyticsIncidentsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        by_type = Counter(
            Incident.objects.values_list("disaster_type", flat=True)
        )
        by_state = (
            Incident.objects.values("state")
            .annotate(count=Count("id"))
            .order_by("-count")[:10]
        )
        by_alert = Counter(
            Incident.objects.values_list("alert_level", flat=True)
        )

        return Response({
            "by_disaster_type": dict(by_type),
            "by_state": list(by_state),
            "by_alert_level": dict(by_alert),
        })


class AnalyticsResourcesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        active = Incident.objects.filter(status__in=["active", "responding", "verified"]).count()
        deployed_estimate = active * 12
        return Response({
            "inventory_items": 5151,
            "deployed_estimate": deployed_estimate,
            "reserve_ready": max(0, 5151 - deployed_estimate),
            "depot_utilization_pct": round(min(99, deployed_estimate / 5151 * 100), 1),
        })
