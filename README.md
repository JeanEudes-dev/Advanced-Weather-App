# Advanced Weather App

## Purpose

The **Advanced Weather App** provides accurate and real-time weather information for any location worldwide. It includes detailed forecasts, current conditions, and various weather insights. The app also allows users to manage and persist weather data with CRUD functionality, export data, and explore additional integrations like maps and videos.

---
## Live url 
[Vercel](https://vercel.com/jeaneudes-devs-projects/weather-app/Ejmm6hJbruppn6HJeKR4GPQWTPHi)

## Features

### Core Features

- Current weather conditions.
- 5-day detailed weather forecast.
- Search functionality supporting multiple location formats (city, ZIP code, GPS coordinates).
- Integration with unsplash and breaking bad quotes.

### Additional Functionality

- **CRUD Operations**: Users can create, read, update, and delete weather records in a database.
- **Data Export**: Weather data can be exported in JSON, CSV, and PDF formats.
- **API Integrations**:
  - Location-based images fetched from Unsplash.
  - Breaking bad quotes from breakingbadquotes.xyz.

---

## How to Run

### Prerequisites

- **Node.js** installed on your machine.
- **npm** (Node Package Manager) installed.
- **Python 3.x** and **pip** installed.

---

### Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/JeanEudes-dev/Advanced-Weather-app.git
```

#### 2. Navigate to the Project Directory

```bash
cd Advanced-Weather-app
```

---

### Running the Frontend

1. Navigate to the `weather-app` directory:
   ```bash
   cd weather-app
   ```
2. Install the dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open your browser and go to `http://localhost:5173` to view the app.

---

### Running the Backend

1. Navigate to the `weather_backend` directory:
   ```bash
   cd weather_backend
   ```
2. Install the backend dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Run database migrations (if applicable):
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```
4. Start the backend server:
   ```bash
   python manage.py runserver
   ```
5. The backend server will run on `http://localhost:8000`.

---

## API Keys

To enable all app functionalities:

1. Obtain the following API keys:
   - **OpenWeather API Key**
   - **Unsplash API Key** (optional)
2. Create a `.env` file in both the frontend and backend directories to store the keys securely. Example:

   ```
    const API_KEY = your_openweather_api_key;
    const WEATHER_URL = "https://api.openweathermap.org/data/2.5/weather";
    const FORECAST_URL = "https://api.openweathermap.org/data/2.5/forecast";
    const UNSPLASH_API_KEY = you_unsplash_api_key;
    const UNSPLASH_URL = "https://api.unsplash.com/search/photos";
    const DJANGO_API_URL = "http://localhost:8000/api/weather/";
    const DJANGO_CSV_URL = "http://localhost:8000/api/weather/export/csv/";

   ```

---

## Contributing

If you'd like to contribute:

1. Fork the repository.
2. Make your changes.
3. Submit a pull request for review.

---

## Demo Video

A short demo video showcasing the app is available here: **[Demo Link](#)**
