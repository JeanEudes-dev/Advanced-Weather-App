// V2.tsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaSearchLocation, FaTemperatureLow, FaTint, FaMapMarkerAlt, FaWind } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import Quotes from "./Quotes";

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

interface WeatherEntry {
    id: number;
    location: string;
    date_range_start: string;
    date_range_end: string;
    temperature: number;
    humidity: number;
    wind_speed: number;
    weather_description: string;
}

const V2: React.FC = () => {
    const [location, setLocation] = useState<string>("");
    const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
    const [forecastData, setForecastData] = useState<ForecastData[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [backgroundImage, setBackgroundImage] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [weatherOverview, setWeatherOverview] = useState<WeatherOverview | null>(null);
    const [weatherEntries, setWeatherEntries] = useState<WeatherEntry[]>([]);
    const [crudError, setCrudError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [selectedEntry, setSelectedEntry] = useState<WeatherEntry | null>(null);
    const [entryData, setEntryData] = useState<WeatherEntry | null>(null);

    const API_KEY = import.meta.env.VITE_API_KEY || "";
    const WEATHER_URL = import.meta.env.VITE_WEATHER_URL || "";
    const FORECAST_URL = import.meta.env.VITE_FORECAST_URL || "";
    const UNSPLASH_API_KEY = import.meta.env.VITE_UNSPLASH_API_KEY || "";
    const UNSPLASH_URL = import.meta.env.VITE_UNSPLASH_URL || "";
    const DJANGO_API_URL = import.meta.env.VITE_DJANGO_API_URL || "";
    const DJANGO_CSV_URL = import.meta.env.VITE_DJANGO_CSV_URL || "";


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
            const imageUrl = await fetchBackgroundImage(location);
            setBackgroundImage(imageUrl);
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
            const locationName = weatherResponse.data.name || "nature";
            const imageUrl = await fetchBackgroundImage(locationName);
            setBackgroundImage(imageUrl);
            setWeatherData(weatherResponse.data);
            setForecastData(forecastResponse.data.list.slice(0, 5));
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

    const fetchWeatherEntries = async () => {
        try {
            const response = await axios.get(DJANGO_API_URL);
            setWeatherEntries(response.data);
        } catch (error) {
            console.error("Error fetching weather entries:", error);
        }
    };

    const createWeatherEntry = async (data: WeatherEntry) => {
        try {
            const response = await axios.post(DJANGO_API_URL, data);
            if (response.status === 201) {
                setWeatherEntries([...weatherEntries, response.data]);
                setCrudError(null);
            } else {
                setCrudError("Failed to create entry. Please try again.");
            }
        } catch (err) {
            console.error("Error creating weather entry:", err);
            if (axios.isAxiosError(err)) {
                setCrudError(err.response?.data?.message || "An error occurred while creating the entry.");
            } else {
                setCrudError("An unexpected error occurred. Please try again.");
            }
        }
    };

    const updateWeatherEntry = async (id: number, data: Partial<WeatherEntry>) => {
        try {
            const response = await axios.put(`${DJANGO_API_URL}${id}/`, data);
            setWeatherEntries(
                weatherEntries.map(entry => (entry.id === id ? { ...entry, ...response.data } : entry))
            );
            setIsModalOpen(false);
        } catch (error) {
            console.error("Error updating weather entry:", error);
        }
    };

    const deleteWeatherEntry = async (id: number) => {
        try {
            await axios.delete(`${DJANGO_API_URL}${id}/`);
            setWeatherEntries(weatherEntries.filter(entry => entry.id !== id));
        } catch (error) {
            console.error("Error deleting weather entry:", error);
        }
    };

    const [newEntry, setNewEntry] = useState<Partial<WeatherEntry>>({
        location: "",
        date_range_start: "",
        date_range_end: "",
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewEntry({ ...newEntry, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newEntry.location || !newEntry.date_range_start || !newEntry.date_range_end) {
            setCrudError("Please fill in all fields.");
            return;
        }

        try {
            await createWeatherEntry(newEntry as WeatherEntry);
            setNewEntry({
                location: "",
                date_range_start: "",
                date_range_end: "",
            });
        } catch (err) {
            console.error("Error submitting form:", err);
        }
    };

    const handleUpdateClick = (entry: WeatherEntry) => {
        setSelectedEntry(entry);
        setIsModalOpen(true);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
    };

    const handleModalSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedEntry) {
            const updatedData = {
                date_range_start: selectedEntry.date_range_start,
                date_range_end: selectedEntry.date_range_end,
            };
            updateWeatherEntry(selectedEntry.id, updatedData);
        }
    };

    const handleModalInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (selectedEntry) {
            setSelectedEntry({ ...selectedEntry, [e.target.name]: e.target.value });
        }
    };

    const downloadCSV = async () => {
        try {
            const response = await axios.get(DJANGO_CSV_URL, {
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'weather_entries.csv');
            document.body.appendChild(link);
            link.click();
        } catch (error) {
            console.error('Error downloading CSV:', error);
        }
    };

    const fetchEntryById = async (id: number) => {
        try {
            const response = await axios.get(`${DJANGO_API_URL}${id}/`);
            setEntryData(response.data);
            setIsModalOpen(true);
        } catch (error) {
            console.error("Error fetching entry by ID:", error);
            return null;
        }
    }

    useEffect(() => {
        fetchWeatherEntries();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="app">
            <button type="button" onClick={() => window.location.href = '/'} className="nav-btn">Basic</button>
            <Quotes />
            {/* Search Bar */}
            <div className="search-container">
                <h1>Advanced Weather App</h1>
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
                        className="weather-container"
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

            {/* CRUD Section */}
            <div className="crud-section">
                <h2>Manage Weather Data</h2>
                {crudError && <p className="error">{crudError}</p>} {/* Display CRUD errors */}
                <form onSubmit={handleSubmit} className="crud-form">
                    <div className="form-group">
                        <label>
                            Location:
                            <input
                                type="text"
                                name="location"
                                value={newEntry.location}
                                onChange={handleInputChange}
                                required
                            />
                        </label>
                    </div>
                    <div className="form-group">
                        <label>
                            Date Range Start:
                            <input
                                type="date"
                                name="date_range_start"
                                value={newEntry.date_range_start}
                                onChange={handleInputChange}
                                required
                            />
                        </label>
                    </div>
                    <div className="form-group">
                        <label>
                            Date Range End:
                            <input
                                type="date"
                                name="date_range_end"
                                value={newEntry.date_range_end}
                                onChange={handleInputChange}
                                required
                            />
                        </label>
                    </div>
                    <button type="submit" className="submit-button">Add Entry</button>
                </form>
                <ul className="entries-list">
                    {weatherEntries && weatherEntries.map((entry) => (
                        <li key={entry.id} className="entry-item" onClick={() => fetchEntryById(entry.id)}>
                            <div className="entry-details">
                                <strong>{entry.location}</strong> - {entry.date_range_start} to {entry.date_range_end}
                            </div>
                            <div className="entry-actions">
                                <button onClick={() => handleUpdateClick(entry)} className="update-button">Update</button>
                                <button onClick={() => deleteWeatherEntry(entry.id)} className="delete-button">Delete</button>
                            </div>
                        </li>
                    ))}
                </ul>
                <button onClick={downloadCSV} className="download-button">Download CSV</button>
            </div>
            {/* Modal for Updating Date Range */}
            {isModalOpen && (
                <div className="modal">
                    {selectedEntry &&
                        <div className="modal-content">
                            <span className="close" onClick={handleModalClose}>&times;</span>
                            <h2 style={{ color: "black" }}>Update Date Range</h2>
                            <form onSubmit={handleModalSubmit}>
                                <div className="form-group">
                                    <label>
                                        Date Range Start:
                                        <input
                                            type="date"
                                            name="date_range_start"
                                            value={selectedEntry?.date_range_start || ""}
                                            onChange={handleModalInputChange}
                                            required
                                        />
                                    </label>
                                </div>
                                <div className="form-group">
                                    <label>
                                        Date Range End:
                                        <input
                                            type="date"
                                            name="date_range_end"
                                            value={selectedEntry?.date_range_end || ""}
                                            onChange={handleModalInputChange}
                                            required
                                        />
                                    </label>
                                </div>
                                <button type="submit" className="submit-button">Save Changes</button>
                            </form>
                        </div>}
                    {entryData && (
                        <div className="modal-content" style={{ color: "black" }}>
                            <span className="close" onClick={handleModalClose}>&times;</span>
                            <h3>Entry Data</h3>
                            <p><strong>Location:</strong> {entryData.location}</p>
                            <p><strong>Date Range Start:</strong> {entryData.date_range_start}</p>
                            <p><strong>Date Range End:</strong> {entryData.date_range_end}</p>
                            <p><strong>Temperature:</strong> {entryData.temperature}°C</p>
                            <p><strong>Humidity:</strong> {entryData.humidity}%</p>
                            <p><strong>Wind Speed:</strong> {entryData.wind_speed} m/s</p>
                            <p><strong>Weather Description:</strong> {entryData.weather_description}</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default V2;