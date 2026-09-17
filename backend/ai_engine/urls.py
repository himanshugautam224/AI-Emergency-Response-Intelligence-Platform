"""AI Engine URL routing."""

from django.urls import path
from .views import (
    FullTriageReportView,
    DisasterTypePredictionView,
    AlertLevelPredictionView,
    RiskScorePredictionView,
    PriorityScorePredictionView,
    ResourceDemandPredictionView,
    ResponseTimePredictionView,
)

urlpatterns = [
    # Full AI triage (all models at once)
    path('triage/', FullTriageReportView.as_view(), name='ai-triage'),

    # Individual model endpoints
    path('predict/disaster-type/', DisasterTypePredictionView.as_view(), name='predict-disaster-type'),
    path('predict/alert-level/', AlertLevelPredictionView.as_view(), name='predict-alert-level'),
    path('predict/risk-score/', RiskScorePredictionView.as_view(), name='predict-risk-score'),
    path('predict/priority/', PriorityScorePredictionView.as_view(), name='predict-priority'),
    path('predict/resource-demand/', ResourceDemandPredictionView.as_view(), name='predict-resource-demand'),
    path('predict/response-time/', ResponseTimePredictionView.as_view(), name='predict-response-time'),
]
