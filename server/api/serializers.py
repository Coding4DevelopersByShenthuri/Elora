from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    confirm_password = serializers.CharField(write_only=True, required=True)
    name = serializers.CharField(write_only=True, required=True)  # Add name field

    class Meta:
        model = User
        fields = ('name', 'username', 'email', 'password', 'confirm_password')

    def validate(self, attrs):
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError({"password": "Passwords do not match."})
        
        # Use name as username (or create username from email)
        attrs['username'] = attrs.get('username', attrs['email'].split('@')[0])
        return attrs

    def create(self, validated_data):
        # Extract name and use it as first_name and last_name
        name = validated_data.pop('name')
        name_parts = name.split(' ', 1)
        
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=name_parts[0],
            last_name=name_parts[1] if len(name_parts) > 1 else ''
        )
        return user

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)