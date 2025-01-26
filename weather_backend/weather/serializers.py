from rest_framework import serializers
from .models import WeatherEntry

class WeatherEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = WeatherEntry
        fields = '__all__'