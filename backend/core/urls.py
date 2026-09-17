"""
URL Configuration for Emergency Response Intelligence Platform.
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),

    # API v1 routes
    path('api/v1/auth/', include('accounts.urls')),
    path('api/v1/incidents/', include('incidents.urls')),
    path('api/v1/resources/', include('resources.urls')),
    path('api/v1/volunteers/', include('volunteers.urls')),
    path('api/v1/alerts/', include('alerts.urls')),
    path('api/v1/comms/', include('comms.urls')),
    path('api/v1/ai/', include('ai_engine.urls')),
    path('api/v1/analytics/', include('analytics.urls')),
    path('api/v1/external/', include('external_data.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
