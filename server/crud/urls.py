from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.views.static import serve
from django.urls import re_path

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),  # Add /api prefix to all API URLs
]

# Serve static and media files through Django so they are available
# both in local development (DEBUG=True) and when running under
# gunicorn behind nginx in production (DEBUG=False).
#
# Note: For high-traffic production this is usually offloaded to
# nginx directly, but for this project it's acceptable and ensures
# uploaded thumbnails and videos resolve correctly at /media/.
if settings.DEBUG:
    # In DEBUG mode, use the static() helper
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
else:
    # In production/non-DEBUG mode, serve media files manually
    # This ensures media files are accessible even when DEBUG=False
    urlpatterns += [
        re_path(r'^media/(?P<path>.*)$', serve, {'document_root': settings.MEDIA_ROOT}),
    ]
    # Also serve static files manually in non-DEBUG mode if needed
    urlpatterns += [
        re_path(r'^static/(?P<path>.*)$', serve, {'document_root': settings.STATIC_ROOT}),
    ]
