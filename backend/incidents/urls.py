from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import IncidentViewSet, SOSReportViewSet, IncidentUpdateViewSet

router = DefaultRouter()
router.register(r'sos', SOSReportViewSet, basename='sos')
router.register(r'updates', IncidentUpdateViewSet, basename='updates')
router.register(r'', IncidentViewSet, basename='incidents')

urlpatterns = [
    path('', include(router.urls)),
]
