"""
Serializers for accounts app — auth + user profile.
"""

from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .models import User, Agency


class AgencySerializer(serializers.ModelSerializer):
    class Meta:
        model = Agency
        fields = ['id', 'name', 'code', 'agency_type', 'state', 'district', 'contact_email', 'contact_phone', 'is_active']


class UserSerializer(serializers.ModelSerializer):
    agency_detail = AgencySerializer(source='agency', read_only=True)
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name', 'full_name',
            'phone', 'role', 'agency', 'agency_detail',
            'avatar', 'state', 'district', 'latitude', 'longitude',
            'is_active', 'is_verified', 'date_joined',
        ]
        read_only_fields = ['id', 'date_joined', 'is_verified']

    def get_full_name(self, obj):
        return obj.get_full_name()


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            'email', 'password', 'confirm_password',
            'first_name', 'last_name', 'phone',
            'role', 'agency', 'state', 'district',
        ]

    def validate(self, data):
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError({'confirm_password': 'Passwords do not match.'})
        # Public users cannot self-assign admin roles
        if data.get('role') in ['super_admin', 'agency_admin']:
            raise serializers.ValidationError({'role': 'Cannot self-assign admin roles.'})
        return data

    def create(self, validated_data):
        validated_data.pop('confirm_password')
        return User.objects.create_user(**validated_data)


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        user = authenticate(email=data['email'], password=data['password'])
        if not user:
            raise serializers.ValidationError('Invalid email or password.')
        if not user.is_active:
            raise serializers.ValidationError('This account has been deactivated.')
        data['user'] = user
        return data


class TokenResponseSerializer(serializers.Serializer):
    """Response shape for login/refresh."""
    access = serializers.CharField()
    refresh = serializers.CharField()
    user = UserSerializer()
