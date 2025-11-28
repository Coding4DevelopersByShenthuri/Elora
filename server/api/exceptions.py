"""
Custom exception handler to suppress 401 warnings in Django REST Framework
"""
from rest_framework.views import exception_handler
from rest_framework import status
import logging

logger = logging.getLogger(__name__)


def custom_exception_handler(exc, context):
    """
    Custom exception handler that suppresses WARNING logs for 401 Unauthorized responses.
    These are expected when tokens expire and the client will handle them gracefully.
    """
    response = exception_handler(exc, context)
    
    if response is not None:
        # For 401 errors, log at DEBUG level instead of WARNING
        if response.status_code == status.HTTP_401_UNAUTHORIZED:
            logger.debug(
                f"Unauthorized request to {context.get('request').path} - "
                f"Token may be expired or missing (expected behavior)"
            )
    
    return response

