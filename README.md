# Starune – Stargazing Forecast App

**Starune** helps you check if the sky is clear enough for stargazing at your location.  
Enter your coordinates or search by city, and it’ll give you real-time weather and visibility data to help you plan your night under the stars.

## Check Starune - https://starune.vercel.app/

## Features

### Location Support

- Auto-detect via GPS
- Search by city and country
- Enter latitude and longitude manually

### Forecast Details

- Cloud cover
- Visibility distance
- Humidity levels
- Light pollution estimation

### Time Awareness

- Local time display for the selected location
- Day/Night awareness for accurate feedback

---

## Getting Started

### Prerequisites

- Node.js
- npm

### Setup

Clone the repo:

```bash
git clone https://github.com/anuragbhonsle/starune.git
cd starune
```

Tech Stack

### Frontend

React

Vite

Tailwind CSS

### Backend

Node.js

Express

Axios

## APIs Used

### OpenWeatherMap API

Purpose: Provides current weather data like cloud cover, humidity, visibility, etc.

Endpoint used:

https://api.openweathermap.org

### OpenStreetMap API

Purpose: Converts city name to coordinates (geocoding) and vice versa (reverse geocoding)

Endpoint used:

https://nominatim.openstreetmap.org

## Note:

If the APIs are not responding, it's likely because the backend server
is not running locally on my machine at the moment.  
Please try again later, or clone the repo and run the backend yourself using

pm2 start ecosystem.config.js
