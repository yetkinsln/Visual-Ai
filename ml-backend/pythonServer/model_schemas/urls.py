from django.urls import path
from .views import build_model


urlpatterns = [
    path('buildmodel/', build_model, name='buildmodel'),
    
]
