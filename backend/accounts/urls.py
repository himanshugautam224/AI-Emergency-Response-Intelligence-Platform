"""Accounts URL routing."""

from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterView, LoginView, LogoutView, MeView,
    AgencyListView, AgencyDetailView, UserListView,
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='auth-register'),
    path('login/', LoginView.as_view(), name='auth-login'),
    path('logout/', LogoutView.as_view(), name='auth-logout'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    path('me/', MeView.as_view(), name='auth-me'),
    path('agencies/', AgencyListView.as_view(), name='agency-list'),
    path('agencies/<int:pk>/', AgencyDetailView.as_view(), name='agency-detail'),
    path('users/', UserListView.as_view(), name='user-list'),
]
