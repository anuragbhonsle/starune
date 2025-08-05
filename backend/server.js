const express = require("express");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get("/api/iss", async (req, res) => {
  try {
    const response = await axios.get("http://api.open-notify.org/iss-now.json");
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching ISS data:", error);
    res.status(500).json({ error: "Failed to fetch ISS data" });
  }
});

app.get("/api/weather", async (req, res) => {
  try {
    const { lat, lng } = req.query;
    if (!lat || !lng) {
      return res
        .status(400)
        .json({ error: "Latitude and longitude are required" });
    }

    const apiKey = process.env.OPENWEATHER_API_KEY;
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${apiKey}&units=metric`;

    const response = await axios.get(weatherUrl);
    const weatherData = response.data;

    // Extract relevant weather data for stargazing
    const realWeatherData = {
      cloudCover: weatherData.clouds?.all || 0,
      visibility: weatherData.visibility ? weatherData.visibility / 1000 : 10, // Convert to km
      temperature: weatherData.main?.temp || 0,
      humidity: weatherData.main?.humidity || 0,
      description: weatherData.weather?.[0]?.description || "",
      isGoodForStargazing:
        (weatherData.clouds?.all || 0) < 30 &&
        (weatherData.visibility ? weatherData.visibility / 1000 : 10) > 5 &&
        (weatherData.main?.humidity || 0) < 80,
    };

    res.json(realWeatherData);
  } catch (error) {
    console.error("Error fetching weather data:", error);
    res.status(500).json({ error: "Failed to fetch weather data" });
  }
});

app.get("/api/stargazing-possibility", async (req, res) => {
  try {
    const { lat, lng } = req.query;
    if (!lat || !lng) {
      return res
        .status(400)
        .json({ error: "Latitude and longitude are required" });
    }

    // Mock calculation for stargazing possibility
    const weatherData = {
      cloudCover: Math.random() * 100,
      visibility: Math.random() * 10,
      temperature: Math.random() * 30 - 10,
      humidity: Math.random() * 100,
    };

    const isGoodForStargazing =
      weatherData.cloudCover < 30 &&
      weatherData.visibility > 5 &&
      weatherData.humidity < 80;

    const recommendation = isGoodForStargazing
      ? "Great conditions for stargazing tonight!"
      : "Conditions are not ideal for stargazing. Try another night.";

    res.json({
      isGoodForStargazing,
      recommendation,
      weatherData,
      factors: {
        cloudCover: weatherData.cloudCover < 30 ? "Good" : "Poor",
        visibility: weatherData.visibility > 5 ? "Good" : "Poor",
        humidity: weatherData.humidity < 80 ? "Good" : "Poor",
      },
    });
  } catch (error) {
    console.error("Error calculating stargazing possibility:", error);
    res
      .status(500)
      .json({ error: "Failed to calculate stargazing possibility" });
  }
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Star gazing API is running" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});
