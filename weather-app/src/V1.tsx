import React, { useState } from "react";
import axios from "axios";
import { FaSearchLocation, FaTemperatureLow, FaTint, FaMapMarkerAlt, FaWind } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

interface ForecastData {
    dt_txt: string;
    main: {
        temp: number;
    };
    weather: {
        description: string;
        icon: string;
    }[];
}

interface WeatherData {
    name: string;
    main: {
        temp: number;
        humidity: number;
    };
    weather: {
        description: string;
        icon: string;
    }[];
    coord: {
        lat: number;
        lon: number;
    };
    wind: {
        speed: number;
    };
}

interface WeatherOverview {
    temp: number;
    humidity: number;
    wind_speed: number;
    weather: {
        description: string;
        icon: string;
    }[];
}

const App: React.FC = () => {
    const [location, setLocation] = useState<string>("");
    const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
    const [forecastData, setForecastData] = useState<ForecastData[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [backgroundImage, setBackgroundImage] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [weatherOverview, setWeatherOverview] = useState<WeatherOverview | null>(null);

    const API_KEY = "acd2d248af0431cc081abc332524d1a0";
    const WEATHER_URL = "https://api.openweathermap.org/data/2.5/weather";
    const FORECAST_URL = "https://api.openweathermap.org/data/2.5/forecast";
    const UNSPLASH_API_KEY = "auShS9fHuCJdWQEuTMqnq2JCAo7p5XrkwW3vQAxfsbQ";
    const UNSPLASH_URL = "https://api.unsplash.com/search/photos";

    const fetchBackgroundImage = async (query: string) => {
        try {
            const response = await axios.get(UNSPLASH_URL, {
                params: {
                    query,
                    client_id: UNSPLASH_API_KEY,
                    orientation: "landscape",
                    per_page: 1,
                },
            });

            if (response.data && response.data.results && response.data.results.length > 0) {
                return response.data.results[0].urls.regular;
            }
            return "default_image.jpg";
        } catch (err) {
            console.error("Error fetching background image:", err);
            return "default_image.jpg";
        }
    };

    const fetchWeather = async () => {
        if (!location.trim()) {
            setError("Please enter a valid location.");
            return;
        }
        setError(null);
        setIsLoading(true);

        try {
            const weatherResponse = await axios.get(WEATHER_URL, {
                params: {
                    q: location,
                    appid: API_KEY,
                    units: "metric",
                },
            });

            const forecastResponse = await axios.get(FORECAST_URL, {
                params: {
                    q: location,
                    appid: API_KEY,
                    units: "metric",
                },
            });

            setWeatherData(weatherResponse.data);
            setForecastData(forecastResponse.data.list.slice(0, 5));

            // Fetch background image based on location
            const imageUrl = await fetchBackgroundImage(location);
            setBackgroundImage(imageUrl);

            // Fetch weather overview
            await fetchWeatherOverview(weatherResponse.data.coord.lat, weatherResponse.data.coord.lon);
        } catch (err) {
            setError("Could not fetch weather data. Please try again.");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchWeatherByCoords = async (latitude: number, longitude: number) => {
        try {
            const weatherResponse = await axios.get(WEATHER_URL, {
                params: {
                    lat: latitude,
                    lon: longitude,
                    appid: API_KEY,
                    units: "metric",
                },
            });

            const forecastResponse = await axios.get(FORECAST_URL, {
                params: {
                    lat: latitude,
                    lon: longitude,
                    appid: API_KEY,
                    units: "metric",
                },
            });

            // Fetch background image based on city name or general "weather" tag
            const locationName = weatherResponse.data.name || "nature";
            const imageUrl = await fetchBackgroundImage(locationName);
            setBackgroundImage(imageUrl);

            setWeatherData(weatherResponse.data);
            setForecastData(forecastResponse.data.list.slice(0, 5));

            // Fetch weather overview
            await fetchWeatherOverview(latitude, longitude);
        } catch (err) {
            setError("Could not fetch weather data for your location. Please try again.");
            console.error(err);
        }
    };

    const fetchWeatherOverview = async (latitude: number, longitude: number) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await axios.get(`https://api.openweathermap.org/data/3.0/onecall`, {
                params: {
                    lat: latitude,
                    lon: longitude,
                    appid: API_KEY,
                    units: "metric",
                },
            });

            // Extract relevant data from the response
            const overviewData = {
                temp: response.data.current.temp,
                humidity: response.data.current.humidity,
                wind_speed: response.data.current.wind_speed,
                weather: response.data.current.weather,
            };

            setWeatherOverview(overviewData);
        } catch (err) {
            setError("Could not fetch weather overview. Please try again.");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="app">
            <button type="button" onClick={() => window.location.href = '/advanced'} className="nav-btn">Advanced</button>
            {/* Search Bar */}
            <div className="search-container">
                <h1>Basic Weather App</h1>

                <div className="search-bar">
                    <input
                        type="text"
                        placeholder="Enter city name"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                    />
                    <button onClick={fetchWeather}>
                        <FaSearchLocation /> Search
                    </button>
                    <button
                        onClick={() => {
                            navigator.geolocation.getCurrentPosition(
                                (position) => {
                                    const { latitude, longitude } = position.coords;
                                    fetchWeatherByCoords(latitude, longitude);
                                },
                                () => setError("Unable to fetch your location.")
                            );
                        }}
                    >
                        <FaMapMarkerAlt /> Use My Location
                    </button>
                </div>
                {error && <p className="error">{error}</p>}
            </div>
            {weatherData && (
                <h2>
                    <FaMapMarkerAlt /> {weatherData.name}
                </h2>
            )}
            {/* Top Image */}
            {backgroundImage && (
                <motion.div
                    className="top-image"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1 }}
                >
                    <img src={backgroundImage} alt={location} />
                </motion.div>
            )}

            {/* Weather Info and Overview */}
            <AnimatePresence>
                {weatherData && (
                    <motion.div
                        className="weather-container" // New container for flex layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.5 }}
                    >
                        {/* Weather Info */}
                        <div className="weather-info">
                            <div className="weather-details">
                                <img
                                    src={`http://openweathermap.org/img/wn/${weatherData.weather[0].icon}@4x.png`}
                                    alt={weatherData.weather[0].description}
                                />
                                <div className="weather-stats">
                                    <p>
                                        <FaTemperatureLow /> {weatherData.main.temp}°C
                                    </p>
                                    <p>
                                        <FaTint /> {weatherData.main.humidity}%
                                    </p>
                                    <p>{weatherData.weather[0].description}</p>
                                </div>
                            </div>
                        </div>

                        {/* Weather Overview */}
                        {weatherOverview && (
                            <div className="weather-overview">
                                <h3>Weather Overview</h3>
                                <p>
                                    <FaWind /> Wind Speed: {weatherOverview.wind_speed} m/s
                                </p>
                                <p>
                                    <FaTemperatureLow /> Temperature: {weatherOverview.temp}°C
                                </p>
                                <p>
                                    <FaTint /> Humidity: {weatherOverview.humidity}%
                                </p>
                                <p>Condition: {weatherOverview.weather[0].description}</p>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Forecast */}
            {forecastData.length > 0 && (
                <motion.div
                    className="forecast"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1, duration: 0.5 }}
                >
                    <h2>5-Day Forecast</h2>
                    <div className="forecast-cards">
                        {forecastData.map((forecast, index) => (
                            <motion.div
                                key={index}
                                className="forecast-card"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.2, duration: 0.5 }}
                            >
                                <p>{new Date(forecast.dt_txt).toLocaleDateString()}</p>
                                <img
                                    src={`http://openweathermap.org/img/wn/${forecast.weather[0].icon}@2x.png`}
                                    alt={forecast.weather[0].description}
                                />
                                <p>{forecast.main.temp}°C</p>
                                <p>{forecast.weather[0].description}</p>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Loading Spinner */}
            {isLoading && (
                <motion.div
                    className="loading-spinner"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    Loading...
                </motion.div>
            )}
        </div>
    );
};

export default App;