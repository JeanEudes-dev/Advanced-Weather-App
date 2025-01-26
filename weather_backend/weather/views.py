import csv
from datetime import datetime
from django.http import HttpResponse, JsonResponse
from rest_framework import generics, status
from rest_framework.response import Response
from .models import WeatherEntry
from .serializers import WeatherEntrySerializer
import requests

API_KEY = "acd2d248af0431cc081abc332524d1a0"

def fetch_weather_data(location, start_date, end_date):
    # Ensure start_date and end_date are date objects
    if isinstance(start_date, datetime):
        start_date = start_date.date()
    if isinstance(end_date, datetime):
        end_date = end_date.date()
        
    # Convert start_date to datetime object
    start_date = datetime.combine(start_date, datetime.min.time())
    
    url = f"https://api.openweathermap.org/data/3.0/onecall/timemachine"
    params = {
        "appid": API_KEY,
        "lat": 0,
        "lon": 0, 
        "dt": int(start_date.timestamp()), 
    }
    
    # Fetch coordinates for the location
    geocoding_url = f"http://api.openweathermap.org/geo/1.0/direct"
    geocoding_params = {
        "q": location,
        "appid": API_KEY,
    }
    geocoding_response = requests.get(geocoding_url, params=geocoding_params)
    if geocoding_response.status_code == 200:
        geocoding_data = geocoding_response.json()
        if geocoding_data:
            params["lat"] = geocoding_data[0]["lat"]
            params["lon"] = geocoding_data[0]["lon"]
            weather_response = requests.get(url, params=params)
            if weather_response.status_code == 200:
                weather_data = weather_response.json()
                return weather_data
    return None

class WeatherEntryListCreateView(generics.ListCreateAPIView):
    queryset = WeatherEntry.objects.all()
    serializer_class = WeatherEntrySerializer

    def create(self, request, *args, **kwargs):
        location = request.data.get('location')
        date_range_start = datetime.strptime(request.data.get('date_range_start'), "%Y-%m-%d").date()
        date_range_end = datetime.strptime(request.data.get('date_range_end'), "%Y-%m-%d").date()

        if not location or not date_range_start or not date_range_end:
            return Response({"error": "All fields are required"}, status=status.HTTP_400_BAD_REQUEST)

        weather_data = fetch_weather_data(location, date_range_start, date_range_end)
        
        if not weather_data:
            return Response({"error": "Could not fetch weather data"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Extract relevant data from the weather response
        temperature = weather_data['data'][0]['temp']
        humidity = weather_data['data'][0]['humidity']
        wind_speed = weather_data['data'][0]['wind_speed']
        weather_description = weather_data['data'][0]['weather'][0]['description']

        # Save the data to the database
        weather_entry = WeatherEntry.objects.create(
            location=location,
            date_range_start=date_range_start,
            date_range_end=date_range_end,
            temperature=temperature,
            humidity=humidity,
            wind_speed=wind_speed,
            weather_description=weather_description
        )
        serializer = self.get_serializer(weather_entry)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class WeatherEntryRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = WeatherEntry.objects.all()
    serializer_class = WeatherEntrySerializer

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        date_range_start = request.data.get('date_range_start')
        date_range_end = request.data.get('date_range_end')

        if date_range_start:
            date_range_start = datetime.strptime(date_range_start, "%Y-%m-%d").date()
            instance.date_range_start = date_range_start
        if date_range_end:
            date_range_end = datetime.strptime(date_range_end, "%Y-%m-%d").date()
            instance.date_range_end = date_range_end

        instance.save()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
    
def export_weather_entries_to_json(request):
    weather_entries = WeatherEntry.objects.all()
    data = list(weather_entries.values())
    return JsonResponse(data, safe=False)

def export_weather_entries_to_csv(request):
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename="weather_entries.csv"'

    writer = csv.writer(response)
    writer.writerow(['ID', 'Location', 'Date Range Start', 'Date Range End', 'Temperature', 'Humidity', 'Wind Speed', 'Weather Description'])

    weather_entries = WeatherEntry.objects.all()
    for entry in weather_entries:
        writer.writerow([
            entry.id,
            entry.location,
            entry.date_range_start,
            entry.date_range_end,
            entry.temperature,
            entry.humidity,
            entry.wind_speed,
            entry.weather_description
        ])

    return response