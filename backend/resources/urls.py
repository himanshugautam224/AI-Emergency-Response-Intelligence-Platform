from django.urls import path
from .views import ResourceListView, ResourceDepotsView, ResourceDeployView

urlpatterns = [
    path('', ResourceListView.as_view(), name='resource-list'),
    path('depots/', ResourceDepotsView.as_view(), name='resource-depots'),
    path('deploy/', ResourceDeployView.as_view(), name='resource-deploy'),
]
