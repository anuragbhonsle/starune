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

### Production Upgrade

Stargaze is now officially **live and independent** from local machines!

### What’s New

- Backend hosted on [Render] → always online
- Frontend deployed on [Vercel]
- No more ngrok or PM2 headaches
- Works 24/7, even if the laptop is off
- Easy to share with friends & focus on building features

This little upgrade turns our hobby project into a **real production app**!
