from django.db import models

class WeatherEntry(models.Model):
    location = models.CharField(max_length=255)
    date_range_start = models.DateField()
    date_range_end = models.DateField()
    temperature = models.FloatField(null=True, blank=True)
    humidity = models.FloatField(null=True, blank=True)
    wind_speed = models.FloatField(null=True, blank=True)
    weather_description = models.CharField(max_length=255, null=True, blank=True)

    def __str__(self):
        return f"Weather for {self.location} from {self.date_range_start} to {self.date_range_end}"