"""Demo resource logistics API (until inventory models are added)."""

from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

DEMO_RESOURCES = [
    {
        "id": 1,
        "name": "Inflatable Rescue Boats (IRB)",
        "category": "Marine Rescue",
        "total": 45,
        "deployed": 32,
        "available": 13,
        "location": "Odisha Coastal Hub",
        "status": "critical",
    },
    {
        "id": 2,
        "name": "Emergency Food & Water Ration Kits",
        "category": "Relief Supplies",
        "total": 5000,
        "deployed": 3400,
        "available": 1600,
        "location": "Central Warehouse, Nagpur",
        "status": "optimal",
    },
    {
        "id": 3,
        "name": "Advanced Life Support Ambulances",
        "category": "Medical",
        "total": 28,
        "deployed": 21,
        "available": 7,
        "location": "Mumbai Regional Depot",
        "status": "warning",
    },
]

DEMO_DEPOTS = [
    {"id": 1, "name": "NDRF Base — Bhubaneswar", "state": "Odisha", "utilization_pct": 82},
    {"id": 2, "name": "Central Relief Warehouse — Nagpur", "state": "Maharashtra", "utilization_pct": 68},
    {"id": 3, "name": "Coastal Marine Depot — Chennai", "state": "Tamil Nadu", "utilization_pct": 54},
]


class ResourceListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({"count": len(DEMO_RESOURCES), "results": DEMO_RESOURCES})


class ResourceDepotsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({"results": DEMO_DEPOTS})


class ResourceDeployView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        resource_id = request.data.get("resource_id")
        quantity = request.data.get("quantity", 1)
        incident_id = request.data.get("incident_id")
        return Response({
            "success": True,
            "message": f"Dispatched {quantity} unit(s) of resource #{resource_id} to incident #{incident_id}",
        })
