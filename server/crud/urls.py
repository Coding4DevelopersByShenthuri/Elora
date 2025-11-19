from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),  # Add /api prefix to all API URLs
]

# Serve static and media files through Django so they are available
# both in local development (DEBUG=True) and when running under
# gunicorn in Docker behind nginx (DEBUG=False).
#
# Note: For high-traffic production this is usually offloaded to
# nginx directly, but for this project it's acceptable and ensures
# uploaded thumbnails and videos resolve correctly at /media/.
urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
