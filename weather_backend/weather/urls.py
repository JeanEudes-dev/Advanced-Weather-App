from django.urls import path
from .views import WeatherEntryListCreateView, WeatherEntryRetrieveUpdateDestroyView, export_weather_entries_to_csv, export_weather_entries_to_json

urlpatterns = [
    path('weather/', WeatherEntryListCreateView.as_view(), name='weather-list-create'),
    path('weather/<int:pk>/', WeatherEntryRetrieveUpdateDestroyView.as_view(), name='weather-retrieve-update-destroy'),
    path('weather/export/json/', export_weather_entries_to_json, name='weather-export-json'),
    path('weather/export/csv/', export_weather_entries_to_csv, name='weather-export-csv'),
]