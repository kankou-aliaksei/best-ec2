from django.urls import path
from .views import instances, regions, availability_zones

urlpatterns = [
    path('instances', instances, name='instances'),
    path('regions', regions, name='regions'),
    path('availability_zones/<str:region>', availability_zones, name='availability_zones'),
]