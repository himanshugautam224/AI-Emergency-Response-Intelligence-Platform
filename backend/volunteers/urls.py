from django.urls import path
from .views import VolunteerListView, VolunteerAssignView

urlpatterns = [
    path('', VolunteerListView.as_view(), name='volunteer-list'),
    path('assign/', VolunteerAssignView.as_view(), name='volunteer-assign'),
]
