from django.urls import path   # pyright: ignore[reportMissingImports]
from .views import *

urlpatterns = [

    path('', home)
]