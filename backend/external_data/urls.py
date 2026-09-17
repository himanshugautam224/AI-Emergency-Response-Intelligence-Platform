from django.urls import path
from .views import EarthquakesFeedView, GDACSFeedView, WeatherFeedView

urlpatterns = [
    path('earthquakes/', EarthquakesFeedView.as_view(), name='external-earthquakes'),
    path('gdacs/', GDACSFeedView.as_view(), name='external-gdacs'),
    path('weather/', WeatherFeedView.as_view(), name='external-weather'),
]
