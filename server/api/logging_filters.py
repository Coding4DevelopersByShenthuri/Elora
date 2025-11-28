"""
Custom logging filter to suppress 401 Unauthorized warnings
"""
import logging


class Suppress401WarningsFilter(logging.Filter):
    """
    Filter that suppresses WARNING level logs for 401 Unauthorized responses.
    These are expected when tokens expire and the client handles them gracefully.
    """
    def filter(self, record):
        # Suppress warnings that contain "Unauthorized" and "401"
        message = str(record.getMessage())
        if record.levelno == logging.WARNING:
            if 'Unauthorized' in message and '401' in message:
                return False
            # Also check for the specific Django request log format
            if 'WARNING' in message and '401' in message:
                return False
        return True

