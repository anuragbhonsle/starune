# Starune – Stargazing Forecast App

**Starune** helps you check if the sky is clear enough for stargazing at your location.  
Enter your coordinates or search by city, and it’ll give you real-time weather and visibility data to help you plan your night under the stars.

Check Starune - https://starune.vercel.app/
---

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

- Node.js (v16+)
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

OpenStreetMap

### Backend

Node.js

Express


## APIs Used

### OpenWeatherMap API

Purpose: Provides current weather data like cloud cover, humidity, visibility, etc.  

Endpoint used:

[https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={API_KEY}](https://openweathermap.org/api)

### OpenStreetMap API

Purpose: Converts city name to coordinates (geocoding) and vice versa (reverse geocoding)

Endpoint used:

[[https://nominatim.openstreetmap.org/search?q={city}&format=json

https://nominatim.openstreetmap.org/reverse?lat={lat}&lon={lon}&format=json](https://www.openstreetmap.org/#map=4/21.84/82.79)](https://www.openstreetmap.org/#map=4/21.84/82.79)



