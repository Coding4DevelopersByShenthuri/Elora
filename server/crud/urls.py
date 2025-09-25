from django.contrib import admin  # pyright: ignore[reportMissingImports]
from django.urls import path, include  # pyright: ignore[reportMissingImports]

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('api.urls'))
]
