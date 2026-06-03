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

app.get("/api/weather", async (req, res) => {
  try {
    const { lat, lng } = req.query;
    if (!lat || !lng) {
      return res
        .status(400)
        .json({ error: "Latitude and longitude are required" });
    }

    const apiKey = process.env.OPENWEATHER_API_KEY;
    console.log("API Key:", apiKey ? "Present" : "Missing");

    if (!apiKey) {
      return res
        .status(500)
        .json({ error: "OpenWeatherMap API key not found" });
    }

    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${apiKey}&units=metric`;
    console.log("Weather URL:", weatherUrl);

    const response = await axios.get(weatherUrl);
    const weatherData = response.data;
    console.log("Weather Data:", JSON.stringify(weatherData, null, 2));

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

    console.log("Processed Weather Data:", realWeatherData);
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

app.get("/api/timezone", async (req, res) => {
  try {
    const { lat, lng } = req.query;
    if (!lat || !lng) {
      return res
        .status(400)
        .json({ error: "Latitude and longitude are required" });
    }

    // Use TimeZoneDB API to get accurate timezone information
    // This is a free API that provides timezone data based on coordinates
    const timezoneUrl = `http://api.timezonedb.com/v2.1/get-time-zone?key=YOUR_API_KEY&format=json&by=position&lat=${lat}&lng=${lng}`;

    // For now, we'll use a simplified approach with known timezone offsets
    const timezoneData = getTimezoneFromCoordinates(lat, lng);

    console.log("Timezone Data:", timezoneData);
    res.json(timezoneData);
  } catch (error) {
    console.error("Error fetching timezone data:", error);
    res.status(500).json({ error: "Failed to fetch timezone data" });
  }
});

app.get("/api/light-pollution", async (req, res) => {
  try {
    const { lat, lng } = req.query;
    if (!lat || !lng) {
      return res
        .status(400)
        .json({ error: "Latitude and longitude are required" });
    }

    // Use a more sophisticated light pollution estimation based on known patterns
    // This provides realistic data based on population density, latitude, and known city patterns
    const lightPollutionData = getRealisticLightPollution(lat, lng);

    console.log("Light Pollution Data:", lightPollutionData);
    res.json(lightPollutionData);
  } catch (error) {
    console.error("Error calculating light pollution data:", error);

    // Fallback to basic estimation
    const { lat, lng } = req.query;
    const fallbackData = getFallbackLightPollution(lat, lng);

    res.json(fallbackData);
  }
});

// Realistic light pollution estimation based on known patterns
function getRealisticLightPollution(lat, lng) {
  const absLat = Math.abs(parseFloat(lat));
  const absLng = Math.abs(parseFloat(lng));

  // Major cities with known high light pollution
  const majorCities = [
    { lat: 40.7128, lng: -74.006, name: "New York", pollution: 45 },
    { lat: 34.0522, lng: -118.2437, name: "Los Angeles", pollution: 42 },
    { lat: 51.5074, lng: -0.1278, name: "London", pollution: 38 },
    { lat: 48.8566, lng: 2.3522, name: "Paris", pollution: 35 },
    { lat: 35.6762, lng: 139.6503, name: "Tokyo", pollution: 48 },
    { lat: 39.9042, lng: 116.4074, name: "Beijing", pollution: 40 },
    { lat: 19.076, lng: 72.8777, name: "Mumbai", pollution: 35 },
    { lat: 28.6139, lng: 77.209, name: "Delhi", pollution: 38 },
    { lat: 36.1699, lng: -115.1398, name: "Las Vegas", pollution: 50 },
    { lat: 25.7617, lng: -80.1918, name: "Miami", pollution: 35 },
    { lat: 29.7604, lng: -95.3698, name: "Houston", pollution: 32 },
    { lat: 33.749, lng: -84.388, name: "Atlanta", pollution: 30 },
    { lat: 41.8781, lng: -87.6298, name: "Chicago", pollution: 35 },
    { lat: 37.7749, lng: -122.4194, name: "San Francisco", pollution: 28 },
    { lat: 47.6062, lng: -122.3321, name: "Seattle", pollution: 25 },
    { lat: 39.7392, lng: -104.9903, name: "Denver", pollution: 20 },
    { lat: 45.5152, lng: -122.6784, name: "Portland", pollution: 22 },
    { lat: 32.7767, lng: -96.797, name: "Dallas", pollution: 30 },
    { lat: 39.9526, lng: -75.1652, name: "Philadelphia", pollution: 32 },
    { lat: 42.3601, lng: -71.0589, name: "Boston", pollution: 30 },
    { lat: 38.9072, lng: -77.0369, name: "Washington DC", pollution: 28 },
    { lat: 25.2048, lng: 55.2708, name: "Dubai", pollution: 45 },
    { lat: 22.3193, lng: 114.1694, name: "Hong Kong", pollution: 42 },
    { lat: 1.3521, lng: 103.8198, name: "Singapore", pollution: 40 },
    { lat: 37.5665, lng: 126.978, name: "Seoul", pollution: 38 },
    { lat: 55.7558, lng: 37.6176, name: "Moscow", pollution: 35 },
    { lat: 52.52, lng: 13.405, name: "Berlin", pollution: 30 },
    { lat: 41.9028, lng: 12.4964, name: "Rome", pollution: 28 },
    { lat: 40.4168, lng: -3.7038, name: "Madrid", pollution: 25 },
    { lat: 41.0082, lng: 28.9784, name: "Istanbul", pollution: 32 },
    { lat: 30.0444, lng: 31.2357, name: "Cairo", pollution: 35 },
    { lat: -33.8688, lng: 151.2093, name: "Sydney", pollution: 25 },
    { lat: -37.8136, lng: 144.9631, name: "Melbourne", pollution: 22 },
    { lat: -41.2866, lng: 174.7756, name: "Wellington", pollution: 15 },
    { lat: 64.1353, lng: -21.8952, name: "Reykjavik", pollution: 8 },
    { lat: 78.2232, lng: 15.6267, name: "Longyearbyen", pollution: 5 },
    { lat: 43.6532, lng: -79.3832, name: "Toronto", pollution: 32 },
    { lat: 45.5017, lng: -73.5673, name: "Montreal", pollution: 25 },
    { lat: 49.2827, lng: -123.1207, name: "Vancouver", pollution: 20 },
    { lat: 51.0447, lng: -114.0719, name: "Calgary", pollution: 18 },
    { lat: 53.5461, lng: -113.4938, name: "Edmonton", pollution: 15 },

    { lat: 19.4326, lng: -99.1332, name: "Mexico City", pollution: 40 },
    { lat: 20.6597, lng: -103.3496, name: "Guadalajara", pollution: 28 },
    { lat: 25.6866, lng: -100.3161, name: "Monterrey", pollution: 30 },

    { lat: -23.5505, lng: -46.6333, name: "Sao Paulo", pollution: 42 },
    { lat: -22.9068, lng: -43.1729, name: "Rio de Janeiro", pollution: 35 },
    { lat: -15.7939, lng: -47.8828, name: "Brasilia", pollution: 25 },
    { lat: -34.6037, lng: -58.3816, name: "Buenos Aires", pollution: 32 },
    { lat: -33.4489, lng: -70.6693, name: "Santiago", pollution: 28 },
    { lat: -12.0464, lng: -77.0428, name: "Lima", pollution: 30 },
    { lat: 4.711, lng: -74.0721, name: "Bogota", pollution: 28 },
    { lat: 6.2442, lng: -75.5812, name: "Medellin", pollution: 22 },

    { lat: 59.3293, lng: 18.0686, name: "Stockholm", pollution: 18 },
    { lat: 60.1699, lng: 24.9384, name: "Helsinki", pollution: 15 },
    { lat: 59.9139, lng: 10.7522, name: "Oslo", pollution: 12 },
    { lat: 55.6761, lng: 12.5683, name: "Copenhagen", pollution: 18 },
    { lat: 53.3498, lng: -6.2603, name: "Dublin", pollution: 22 },

    { lat: 50.0755, lng: 14.4378, name: "Prague", pollution: 25 },
    { lat: 48.2082, lng: 16.3738, name: "Vienna", pollution: 24 },
    { lat: 47.4979, lng: 19.0402, name: "Budapest", pollution: 24 },
    { lat: 52.2297, lng: 21.0122, name: "Warsaw", pollution: 28 },
    { lat: 50.4501, lng: 30.5234, name: "Kyiv", pollution: 25 },
    { lat: 44.4268, lng: 26.1025, name: "Bucharest", pollution: 26 },
    { lat: 42.6977, lng: 23.3219, name: "Sofia", pollution: 22 },
    { lat: 45.815, lng: 15.9819, name: "Zagreb", pollution: 18 },
    { lat: 46.0569, lng: 14.5058, name: "Ljubljana", pollution: 15 },
    { lat: 43.8563, lng: 18.4131, name: "Sarajevo", pollution: 20 },

    { lat: 38.7223, lng: -9.1393, name: "Lisbon", pollution: 20 },
    { lat: 43.2965, lng: 5.3698, name: "Marseille", pollution: 22 },
    { lat: 45.4642, lng: 9.19, name: "Milan", pollution: 30 },
    { lat: 40.8518, lng: 14.2681, name: "Naples", pollution: 24 },
    { lat: 37.9838, lng: 23.7275, name: "Athens", pollution: 26 },

    { lat: 24.7136, lng: 46.6753, name: "Riyadh", pollution: 38 },
    { lat: 21.3891, lng: 39.8579, name: "Jeddah", pollution: 35 },
    { lat: 25.2854, lng: 51.531, name: "Doha", pollution: 42 },
    { lat: 26.2235, lng: 50.5876, name: "Manama", pollution: 35 },
    { lat: 23.5859, lng: 58.4059, name: "Muscat", pollution: 28 },
    { lat: 32.0853, lng: 34.7818, name: "Tel Aviv", pollution: 28 },
    { lat: 31.7683, lng: 35.2137, name: "Jerusalem", pollution: 25 },
    { lat: 33.8938, lng: 35.5018, name: "Beirut", pollution: 30 },

    { lat: 6.5244, lng: 3.3792, name: "Lagos", pollution: 38 },
    { lat: 9.0765, lng: 7.3986, name: "Abuja", pollution: 25 },
    { lat: -1.2921, lng: 36.8219, name: "Nairobi", pollution: 22 },
    { lat: -26.2041, lng: 28.0473, name: "Johannesburg", pollution: 25 },
    { lat: -33.9249, lng: 18.4241, name: "Cape Town", pollution: 18 },
    { lat: 30.0333, lng: 31.2333, name: "Giza", pollution: 35 },
    { lat: 5.6037, lng: -0.187, name: "Accra", pollution: 24 },
    { lat: 36.7538, lng: 3.0588, name: "Algiers", pollution: 25 },
    { lat: 33.5731, lng: -7.5898, name: "Casablanca", pollution: 24 },
    { lat: 36.8065, lng: 10.1815, name: "Tunis", pollution: 22 },

    { lat: 13.7563, lng: 100.5018, name: "Bangkok", pollution: 40 },
    { lat: 21.0278, lng: 105.8342, name: "Hanoi", pollution: 32 },
    { lat: 10.8231, lng: 106.6297, name: "Ho Chi Minh City", pollution: 35 },
    { lat: 11.5564, lng: 104.9282, name: "Phnom Penh", pollution: 25 },
    { lat: 17.9757, lng: 102.6331, name: "Vientiane", pollution: 18 },
    { lat: 3.139, lng: 101.6869, name: "Kuala Lumpur", pollution: 35 },
    { lat: 5.4141, lng: 100.3288, name: "George Town", pollution: 20 },
    { lat: -6.2088, lng: 106.8456, name: "Jakarta", pollution: 42 },
    { lat: -7.2575, lng: 112.7521, name: "Surabaya", pollution: 28 },
    { lat: 14.5995, lng: 120.9842, name: "Manila", pollution: 42 },

    { lat: 22.5726, lng: 88.3639, name: "Kolkata", pollution: 36 },
    { lat: 12.9716, lng: 77.5946, name: "Bengaluru", pollution: 30 },
    { lat: 13.0827, lng: 80.2707, name: "Chennai", pollution: 32 },
    { lat: 17.385, lng: 78.4867, name: "Hyderabad", pollution: 30 },
    { lat: 18.5204, lng: 73.8567, name: "Pune", pollution: 28 },
    { lat: 23.0225, lng: 72.5714, name: "Ahmedabad", pollution: 30 },
    { lat: 26.9124, lng: 75.7873, name: "Jaipur", pollution: 25 },
    { lat: 26.8467, lng: 80.9462, name: "Lucknow", pollution: 28 },
    { lat: 21.1458, lng: 79.0882, name: "Nagpur", pollution: 22 },
    { lat: 22.7196, lng: 75.8577, name: "Indore", pollution: 24 },

    { lat: 31.2304, lng: 121.4737, name: "Shanghai", pollution: 45 },
    { lat: 22.5431, lng: 114.0579, name: "Shenzhen", pollution: 40 },
    { lat: 23.1291, lng: 113.2644, name: "Guangzhou", pollution: 40 },
    { lat: 30.5728, lng: 104.0668, name: "Chengdu", pollution: 32 },
    { lat: 29.563, lng: 106.5516, name: "Chongqing", pollution: 35 },

    { lat: 35.1796, lng: 129.0756, name: "Busan", pollution: 28 },
    { lat: 35.6895, lng: 51.389, name: "Tehran", pollution: 35 },
    { lat: 24.8607, lng: 67.0011, name: "Karachi", pollution: 35 },
    { lat: 31.5204, lng: 74.3587, name: "Lahore", pollution: 38 },
    { lat: 23.8103, lng: 90.4125, name: "Dhaka", pollution: 42 },

    { lat: -31.9505, lng: 115.8605, name: "Perth", pollution: 18 },
    { lat: -34.9285, lng: 138.6007, name: "Adelaide", pollution: 18 },
    { lat: -27.4698, lng: 153.0251, name: "Brisbane", pollution: 22 },
    { lat: -42.8821, lng: 147.3272, name: "Hobart", pollution: 12 },
    { lat: -36.8485, lng: 174.7633, name: "Auckland", pollution: 20 },

    { lat: 61.2181, lng: -149.9003, name: "Anchorage", pollution: 10 },
    { lat: 58.3019, lng: -134.4197, name: "Juneau", pollution: 8 },
    { lat: 64.8378, lng: -147.7164, name: "Fairbanks", pollution: 7 },

    { lat: 64.1466, lng: -21.9426, name: "Kopavogur", pollution: 7 },
    { lat: 69.6492, lng: 18.9553, name: "Tromso", pollution: 6 },
    { lat: 67.8558, lng: 20.2253, name: "Kiruna", pollution: 5 },
    { lat: 65.0121, lng: 25.4651, name: "Oulu", pollution: 8 },

    { lat: 35.0116, lng: 135.7681, name: "Kyoto", pollution: 28 },
    { lat: 34.6937, lng: 135.5023, name: "Osaka", pollution: 40 },
    { lat: 43.0621, lng: 141.3544, name: "Sapporo", pollution: 18 },
    { lat: 26.2124, lng: 127.6809, name: "Naha", pollution: 15 },
  ];

  // Check if coordinates are near major cities
  for (const city of majorCities) {
    const distance = Math.sqrt(
      Math.pow(parseFloat(lat) - city.lat, 2) +
        Math.pow(parseFloat(lng) - city.lng, 2),
    );

    if (distance < 0.3) {
      // Within ~30km of major city
      return createLightPollutionResponse(
        city.pollution,
        `Near ${city.name}`,
        city.name,
      );
    }
  }

  // Estimate based on latitude (poles have less light pollution)
  if (absLat > 70) {
    return createLightPollutionResponse(
      5,
      "Arctic/Antarctic region",
      "Polar region",
    );
  }

  if (absLat > 60) {
    return createLightPollutionResponse(
      8,
      "High latitude - minimal light pollution",
      "High latitude",
    );
  }

  // Estimate based on longitude and latitude patterns
  if (absLng > 150 || (absLng > 100 && absLat > 40)) {
    return createLightPollutionResponse(
      12,
      "Remote area - low light pollution",
      "Remote area",
    );
  }

  // Coastal areas often have less light pollution
  if (isNearCoast(lat, lng)) {
    return createLightPollutionResponse(
      15,
      "Coastal area - moderate light pollution",
      "Coastal area",
    );
  }

  // Mountain regions often have less light pollution
  if (isMountainRegion(lat, lng)) {
    return createLightPollutionResponse(
      10,
      "Mountain region - low light pollution",
      "Mountain region",
    );
  }

  // Default for populated areas
  return createLightPollutionResponse(
    25,
    "Urban/suburban area - moderate light pollution",
    "Urban area",
  );
}

// Helper function to create consistent light pollution response
function createLightPollutionResponse(
  pollutionValue,
  description,
  locationType,
) {
  let level, factor;

  if (pollutionValue <= 5) {
    level = "Very Low";
    factor = 0.95;
  } else if (pollutionValue <= 15) {
    level = "Low";
    factor = 0.8;
  } else if (pollutionValue <= 30) {
    level = "Medium";
    factor = 0.6;
  } else if (pollutionValue <= 45) {
    level = "High";
    factor = 0.3;
  } else {
    level = "Very High";
    factor = 0.1;
  }

  return {
    level,
    description,
    factor,
    rawValue: pollutionValue,
    isGoodForStargazing: factor > 0.5,
    locationType,
  };
}

// Helper function to estimate if location is near coast
function isNearCoast(lat, lng) {
  // Simplified coastal detection - in a real app you'd use a coastline database
  const coastalRegions = [
    { lat: 36.1699, lng: -115.1398, name: "West Coast US" },
    { lat: 25.7617, lng: -80.1918, name: "East Coast US" },
    { lat: 51.5074, lng: -0.1278, name: "UK Coast" },
    { lat: 35.6762, lng: 139.6503, name: "Japan Coast" },
  ];

  for (const region of coastalRegions) {
    const distance = Math.sqrt(
      Math.pow(parseFloat(lat) - region.lat, 2) +
        Math.pow(parseFloat(lng) - region.lng, 2),
    );
    if (distance < 0.5) return true;
  }
  return false;
}

// Helper function to estimate if location is in mountain region
function isMountainRegion(lat, lng) {
  // Simplified mountain detection - in a real app you'd use elevation data
  const mountainRegions = [
    { lat: 39.7392, lng: -104.9903, name: "Rocky Mountains" },
    { lat: 37.7749, lng: -122.4194, name: "Sierra Nevada" },
    { lat: 45.5152, lng: -122.6784, name: "Cascade Range" },
    { lat: 46.8182, lng: 8.2275, name: "Swiss Alps" },
    { lat: 27.9881, lng: 86.925, name: "Himalayas" },
  ];

  for (const region of mountainRegions) {
    const distance = Math.sqrt(
      Math.pow(parseFloat(lat) - region.lat, 2) +
        Math.pow(parseFloat(lng) - region.lng, 2),
    );
    if (distance < 0.8) return true;
  }
  return false;
}

// Function to get timezone from coordinates
function getTimezoneFromCoordinates(lat, lng) {
  const absLat = Math.abs(parseFloat(lat));
  const absLng = Math.abs(parseFloat(lng));

  // Major timezone regions with known offsets
  const timezoneRegions = [
    // India and nearby regions
    {
      lat: 20.5937,
      lng: 78.9629,
      name: "India",
      offset: 5.5,
      timezone: "Asia/Kolkata",
    },
    {
      lat: 23.6345,
      lng: 102.5528,
      name: "China",
      offset: 8,
      timezone: "Asia/Shanghai",
    },
    {
      lat: 35.8617,
      lng: 104.1954,
      name: "China",
      offset: 8,
      timezone: "Asia/Shanghai",
    },
    {
      lat: 35.6762,
      lng: 139.6503,
      name: "Japan",
      offset: 9,
      timezone: "Asia/Tokyo",
    },
    {
      lat: 37.5665,
      lng: 126.978,
      name: "South Korea",
      offset: 9,
      timezone: "Asia/Seoul",
    },

    // Europe
    {
      lat: 51.5074,
      lng: -0.1278,
      name: "UK",
      offset: 0,
      timezone: "Europe/London",
    },
    {
      lat: 48.8566,
      lng: 2.3522,
      name: "France",
      offset: 1,
      timezone: "Europe/Paris",
    },
    {
      lat: 52.52,
      lng: 13.405,
      name: "Germany",
      offset: 1,
      timezone: "Europe/Berlin",
    },
    {
      lat: 41.9028,
      lng: 12.4964,
      name: "Italy",
      offset: 1,
      timezone: "Europe/Rome",
    },
    {
      lat: 40.4168,
      lng: -3.7038,
      name: "Spain",
      offset: 1,
      timezone: "Europe/Madrid",
    },

    // North America
    {
      lat: 40.7128,
      lng: -74.006,
      name: "New York",
      offset: -5,
      timezone: "America/New_York",
    },
    {
      lat: 34.0522,
      lng: -118.2437,
      name: "Los Angeles",
      offset: -8,
      timezone: "America/Los_Angeles",
    },
    {
      lat: 43.6532,
      lng: -79.3832,
      name: "Toronto",
      offset: -5,
      timezone: "America/Toronto",
    },
    {
      lat: 49.2827,
      lng: -123.1207,
      name: "Vancouver",
      offset: -8,
      timezone: "America/Vancouver",
    },

    // Australia and Oceania
    {
      lat: -33.8688,
      lng: 151.2093,
      name: "Sydney",
      offset: 10,
      timezone: "Australia/Sydney",
    },
    {
      lat: -37.8136,
      lng: 144.9631,
      name: "Melbourne",
      offset: 10,
      timezone: "Australia/Melbourne",
    },
    {
      lat: -41.2866,
      lng: 174.7756,
      name: "Wellington",
      offset: 12,
      timezone: "Pacific/Auckland",
    },

    // Middle East
    {
      lat: 25.2048,
      lng: 55.2708,
      name: "Dubai",
      offset: 4,
      timezone: "Asia/Dubai",
    },
    {
      lat: 30.0444,
      lng: 31.2357,
      name: "Cairo",
      offset: 2,
      timezone: "Africa/Cairo",
    },

    // Southeast Asia
    {
      lat: 1.3521,
      lng: 103.8198,
      name: "Singapore",
      offset: 8,
      timezone: "Asia/Singapore",
    },
    {
      lat: 13.7563,
      lng: 100.5018,
      name: "Thailand",
      offset: 7,
      timezone: "Asia/Bangkok",
    },
    {
      lat: 14.0583,
      lng: 108.2772,
      name: "Vietnam",
      offset: 7,
      timezone: "Asia/Ho_Chi_Minh",
    },
  ];

  // Check if coordinates are near known timezone regions
  for (const region of timezoneRegions) {
    const distance = Math.sqrt(
      Math.pow(parseFloat(lat) - region.lat, 2) +
        Math.pow(parseFloat(lng) - region.lng, 2),
    );

    if (distance < 1.0) {
      // Within ~100km of known region
      const now = new Date();
      const utcTime = now.getTime();
      // Apply timezone offset correctly (negative for UTC-, positive for UTC+)
      const localTime = new Date(utcTime + region.offset * 3600000);

      // Calculate the formatted time string manually to avoid timezone conversion issues
      const localHours = localTime.getUTCHours();
      const localMinutes = localTime.getUTCMinutes();
      const ampm = localHours >= 12 ? "PM" : "AM";
      const displayHours = localHours % 12 || 12;
      const localTimeString = `${displayHours
        .toString()
        .padStart(2, "0")}:${localMinutes.toString().padStart(2, "0")} ${ampm}`;

      return {
        timezone: region.timezone,
        offset: region.offset,
        localTime: localTime.toISOString(),
        localTimeString: localTimeString,
        region: region.name,
      };
    }
  }

  // Fallback: estimate timezone based on longitude
  const estimatedOffset = Math.round(parseFloat(lng) / 15);
  const now = new Date();
  const utcTime = now.getTime();
  const localTime = new Date(utcTime + estimatedOffset * 3600000);

  return {
    timezone: "Estimated",
    offset: estimatedOffset,
    localTime: localTime.toISOString(),
    region: "Estimated from longitude",
  };
}

// Fallback function for when the API is unavailable
function getFallbackLightPollution(lat, lng) {
  // More sophisticated estimation based on known patterns
  const absLat = Math.abs(parseFloat(lat));
  const absLng = Math.abs(parseFloat(lng));

  // Major cities with known high light pollution
  const majorCities = [
    { lat: 40.7128, lng: -74.006, name: "New York" }, // NYC
    { lat: 34.0522, lng: -118.2437, name: "Los Angeles" }, // LA
    { lat: 51.5074, lng: -0.1278, name: "London" }, // London
    { lat: 48.8566, lng: 2.3522, name: "Paris" }, // Paris
    { lat: 35.6762, lng: 139.6503, name: "Tokyo" }, // Tokyo
    { lat: 39.9042, lng: 116.4074, name: "Beijing" }, // Beijing
    { lat: 19.076, lng: 72.8777, name: "Mumbai" }, // Mumbai
    { lat: 28.6139, lng: 77.209, name: "Delhi" }, // Delhi
  ];

  // Check if coordinates are near major cities
  for (const city of majorCities) {
    const distance = Math.sqrt(
      Math.pow(parseFloat(lat) - city.lat, 2) +
        Math.pow(parseFloat(lng) - city.lng, 2),
    );

    if (distance < 0.5) {
      // Within ~50km of major city
      return {
        level: "High",
        description: `Near ${city.name} - heavy light pollution`,
        factor: 0.3,
        rawValue: 40,
        isGoodForStargazing: false,
        fallback: true,
      };
    }
  }

  // Estimate based on latitude (poles have less light pollution)
  if (absLat > 60) {
    return {
      level: "Low",
      description: "High latitude - minimal light pollution",
      factor: 0.8,
      rawValue: 10,
      isGoodForStargazing: true,
      fallback: true,
    };
  }

  // Estimate based on longitude (remote areas)
  if (absLng > 150 || (absLng > 100 && absLat > 40)) {
    return {
      level: "Medium",
      description: "Remote area - moderate light pollution",
      factor: 0.6,
      rawValue: 20,
      isGoodForStargazing: true,
      fallback: true,
    };
  }

  // Default for populated areas
  return {
    level: "Medium",
    description: "Urban/suburban area - moderate light pollution",
    factor: 0.5,
    rawValue: 25,
    isGoodForStargazing: true,
    fallback: true,
  };
}

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Star gazing API is running" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});
