from django.shortcuts import render  # pyright: ignore[reportMissingImports]
from django.http import HttpResponse  # pyright: ignore[reportMissingImports]
# Create your views here.

def home(request):
    return HttpResponse('This is the homepage')
