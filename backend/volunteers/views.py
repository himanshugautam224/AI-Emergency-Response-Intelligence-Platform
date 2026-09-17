"""Demo volunteer roster API."""

from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

DEMO_VOLUNTEERS = [
    {
        "id": 1,
        "name": "Capt. R. Venkatesh",
        "role": "NDRF Team Leader",
        "state": "Odisha",
        "status": "deployed",
        "skills": ["water_rescue", "medical"],
    },
    {
        "id": 2,
        "name": "Dr. Ananya Pillai",
        "role": "Field Medic",
        "state": "Kerala",
        "status": "available",
        "skills": ["trauma", "triage"],
    },
    {
        "id": 3,
        "name": "Lt. Karan Mehta",
        "role": "Fire & Rescue",
        "state": "Maharashtra",
        "status": "deployed",
        "skills": ["urban_search", "hazmat"],
    },
]


class VolunteerListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({"count": len(DEMO_VOLUNTEERS), "results": DEMO_VOLUNTEERS})


class VolunteerAssignView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        volunteer_id = request.data.get("volunteer_id")
        incident_id = request.data.get("incident_id")
        return Response({
            "success": True,
            "message": f"Volunteer #{volunteer_id} assigned to incident #{incident_id}",
        })
