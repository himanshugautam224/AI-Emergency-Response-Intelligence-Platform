"""
AI Engine — Django REST API views.
Exposes trained ML model predictions via HTTP endpoints.
"""

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from .inference import (
    predict_disaster_type,
    predict_alert_level,
    predict_risk_score,
    predict_priority_score,
    predict_resource_demand,
    predict_response_time,
    full_triage_report,
)


class FullTriageReportView(APIView):
    """
    POST /api/v1/ai/triage/
    Runs all 6 AI models and returns a complete triage report.
    Body: { feature dict with location, weather, infra data }
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            report = full_triage_report(request.data)
            return Response({"success": True, "report": report}, status=status.HTTP_200_OK)
        except FileNotFoundError as e:
            return Response({"error": str(e), "hint": "Run ai_engine/train_model.py first"}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class DisasterTypePredictionView(APIView):
    """POST /api/v1/ai/predict/disaster-type/"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            result = predict_disaster_type(request.data)
            return Response(result)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class AlertLevelPredictionView(APIView):
    """POST /api/v1/ai/predict/alert-level/"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            result = predict_alert_level(request.data)
            return Response(result)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class RiskScorePredictionView(APIView):
    """POST /api/v1/ai/predict/risk-score/"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            result = predict_risk_score(request.data)
            return Response(result)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class PriorityScorePredictionView(APIView):
    """POST /api/v1/ai/predict/priority/"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            result = predict_priority_score(request.data)
            return Response(result)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class ResourceDemandPredictionView(APIView):
    """POST /api/v1/ai/predict/resource-demand/"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            result = predict_resource_demand(request.data)
            return Response(result)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class ResponseTimePredictionView(APIView):
    """POST /api/v1/ai/predict/response-time/"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            result = predict_response_time(request.data)
            return Response(result)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
