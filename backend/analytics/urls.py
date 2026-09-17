from django.urls import path
from .views import AnalyticsOverviewView, AnalyticsIncidentsView, AnalyticsResourcesView

urlpatterns = [
    path('overview/', AnalyticsOverviewView.as_view(), name='analytics-overview'),
    path('incidents/', AnalyticsIncidentsView.as_view(), name='analytics-incidents'),
    path('resources/', AnalyticsResourcesView.as_view(), name='analytics-resources'),
]
