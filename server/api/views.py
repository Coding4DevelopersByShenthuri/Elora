from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import status
from .serializers import RegisterSerializer, LoginSerializer, KidsLessonSerializer, KidsProgressSerializer, KidsAchievementSerializer
from .models import KidsLesson, KidsProgress, KidsAchievement
from rest_framework.permissions import IsAuthenticated
import logging

logger = logging.getLogger(__name__)

def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'token': str(refresh.access_token),
    }

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    try:
        # Create a mutable copy of the request data
        data = request.data.copy()
        
        # If name is provided, use it as username or create username from email
        if 'name' in data and not data.get('username'):
            # Create username from email or use name
            username = data['email'].split('@')[0]
            # Ensure username is unique
            counter = 1
            original_username = username
            while User.objects.filter(username=username).exists():
                username = f"{original_username}{counter}"
                counter += 1
            data['username'] = username
        
        serializer = RegisterSerializer(data=data)
        
        if serializer.is_valid():
            user = serializer.save()
            tokens = get_tokens_for_user(user)
            
            return Response({
                "message": "Registration successful",
                "user": {
                    "id": user.id,
                    "name": f"{user.first_name} {user.last_name}".strip(),
                    "email": user.email,
                },
                "token": tokens['token']
            }, status=status.HTTP_201_CREATED)
            
        return Response({
            "message": "Registration failed",
            "errors": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
        
    except Exception as e:
        logger.error(f"Registration error: {str(e)}")
        return Response({
            "message": "An error occurred during registration"
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    try:
        serializer = LoginSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response({
                "message": "Invalid input",
                "errors": serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        
        email = serializer.validated_data['email']
        password = serializer.validated_data['password']
        
        try:
            # Find user by email
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({
                "message": "Invalid email or password"
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        # Authenticate user
        user = authenticate(username=user.username, password=password)
        
        if user is not None:
            if user.is_active:
                tokens = get_tokens_for_user(user)
                return Response({
                    "message": "Login successful",
                    "user": {
                        "id": user.id,
                        "name": f"{user.first_name} {user.last_name}".strip(),
                        "email": user.email,
                    },
                    "token": tokens['token']
                })
            else:
                return Response({
                    "message": "Account is disabled"
                }, status=status.HTTP_401_UNAUTHORIZED)
        else:
            return Response({
                "message": "Invalid email or password"
            }, status=status.HTTP_401_UNAUTHORIZED)
            
    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        return Response({
            "message": "An error occurred during login"
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Add social authentication placeholder endpoints
@api_view(['GET'])
@permission_classes([AllowAny])
def social_login_redirect(request, provider):
    """
    Placeholder for social authentication
    In a real implementation, this would redirect to the social provider
    """
    return Response({
        "message": f"Social login with {provider} is not yet implemented",
        "provider": provider
    }, status=status.HTTP_501_NOT_IMPLEMENTED)


# Kids endpoints
@api_view(['GET'])
@permission_classes([AllowAny])
def kids_lessons(request):
    qs = KidsLesson.objects.filter(is_active=True).order_by('id')
    serializer = KidsLessonSerializer(qs, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def kids_progress_get(request):
    obj, _ = KidsProgress.objects.get_or_create(user=request.user)
    serializer = KidsProgressSerializer(obj)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def kids_progress_update(request):
    obj, _ = KidsProgress.objects.get_or_create(user=request.user)
    serializer = KidsProgressSerializer(instance=obj, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def kids_achievements(request):
    qs = KidsAchievement.objects.filter(user=request.user).order_by('name')
    serializer = KidsAchievementSerializer(qs, many=True)
    return Response(serializer.data)