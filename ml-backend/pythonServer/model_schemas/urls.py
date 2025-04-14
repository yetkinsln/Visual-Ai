from django.urls import path
from .views import build_model
from .views import cancel

urlpatterns = [
    path('buildmodel/', build_model, name='buildmodel'),
    path('cancel/', cancel, name='cancel_training'),
]
