"""
WebSocket URL routing for real-time communications.
"""
from django.urls import re_path
# from .consumers import ChatConsumer, AlertConsumer  # Uncomment when consumers are built

websocket_urlpatterns = [
    # re_path(r'ws/chat/(?P<room_name>\w+)/$', ChatConsumer.as_asgi()),
    # re_path(r'ws/alerts/$', AlertConsumer.as_asgi()),
]
