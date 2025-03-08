from django.urls import path
from .views import preprocess_csv

urlpatterns = [
    path('preprocess/', preprocess_csv, name='processData'),
]
