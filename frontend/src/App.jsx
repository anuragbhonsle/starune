import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
function App() {
  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const [issData, setIssData] = useState({
    latitude: 0,
    longitude: 0,
    altitude: 0,
  });
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showLocationForm, setShowLocationForm] = useState(false);
  const [showManualForm, setShowManualForm] = useState(false);
  const [stargazingPrediction, setStargazingPrediction] = useState(null);
  const [hoveredButton, setHoveredButton] = useState(null);

  // Generate stars only once to prevent re-randomization
  const stars = useMemo(() => {
    const starArray = [];
    for (let i = 0; i < 150; i++) {
      // Reduced from 200 to 150 for better performance
      starArray.push({
        id: i,
        left: -50 + Math.random() * 200,
        top: Math.random() * 100,
        delay: Math.random() * 6,
      });
    }
    return starArray;
  }, []);

  // Custom hook for button hover effects
  const getButtonStyle = (buttonId) => {
    const isHovered = hoveredButton === buttonId;
    return {
      background: isHovered
        ? "rgba(255, 255, 255, 0.35)"
        : "rgba(255, 255, 255, 0.25)",
      backdropFilter: "blur(15px)",
      WebkitBackdropFilter: "blur(15px)",
      border: "1px solid rgba(255, 255, 255, 0.3)",
      color: "white",
      padding: "0.75rem 1rem",
      borderRadius: "0.5rem",
      fontWeight: "500",
      transition: "all 0.3s ease",
      transform: isHovered ? "translateY(-2px)" : "translateY(0)",
      boxShadow: isHovered
        ? "0 8px 25px rgba(0, 0, 0, 0.4)"
        : "0 4px 12px rgba(0, 0, 0, 0.3)",
    };
  };

  // Fetch ISS data from backend API
  useEffect(() => {
    const fetchIssData = async () => {
      try {
        setError(null);
        const response = await fetch(`${API_BASE_URL}/api/iss`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setIssData({
          latitude: parseFloat(data.iss_position.latitude),
          longitude: parseFloat(data.iss_position.longitude),
          altitude: 434.29, // Approximate ISS altitude
        });
        setLoading(false);
      } catch (error) {
        console.error("Error fetching ISS data:", error);
        setError("Failed to fetch ISS data. Please try again later.");
        setLoading(false);
      }
    };

    // Delay the initial fetch to prevent blocking the render
    const initialTimeout = setTimeout(fetchIssData, 100);
    const interval = setInterval(fetchIssData, 10000); // Update every 10 seconds

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, []);

  const detectLocation = () => {
    if (navigator.geolocation) {
      // Show loading state
      setLoading(true);

      const options = {
        enableHighAccuracy: true,
        timeout: 10000, // 10 seconds
        maximumAge: 60000, // 1 minute
      };

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          console.log("Location detected:", position.coords);

          try {
            // Get place name from coordinates
            const placeInfo = await reverseGeocode(
              position.coords.latitude,
              position.coords.longitude,
            );

            setUserLocation({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              city: placeInfo?.city,
              country: placeInfo?.country,
            });
            analyzeStargazingConditions(
              position.coords.latitude,
              position.coords.longitude,
            );
          } catch (error) {
            console.error("Error getting place name:", error);
            // Still set location even if reverse geocoding fails
            setUserLocation({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
            analyzeStargazingConditions(
              position.coords.latitude,
              position.coords.longitude,
            );
          } finally {
            setLoading(false);
          }
        },
        (error) => {
          console.error("Error getting location:", error);
          setLoading(false);

          let errorMessage = "Unable to detect your location. ";
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage +=
                "Please allow location access in your browser settings.";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage += "Location information is unavailable.";
              break;
            case error.TIMEOUT:
              errorMessage += "Location request timed out. Please try again.";
              break;
            default:
              errorMessage += "Please try manual entry.";
          }

          alert(errorMessage);
        },
        options,
      );
    } else {
      alert(
        "Geolocation is not supported by this browser. Please use manual entry.",
      );
    }
  };

  const dropOnMap = () => {
    setShowLocationForm(true);
  };

  const enterManually = () => {
    setShowManualForm(true);
  };

  const getCurrentTime = async (lat, lng) => {
    try {
      // Get the timezone for the specific location
      const response = await fetch(
        `${API_BASE_URL}/api/timezone?lat=${lat}&lng=${lng}`,
      );

      if (response.ok) {
        const timezoneData = await response.json();
        // Use the pre-formatted time string from the backend
        if (timezoneData.localTimeString) {
          // Create a Date object that represents the local time correctly
          const now = new Date();
          const utcTime = now.getTime();
          const localTime = new Date(utcTime + timezoneData.offset * 3600000);

          // Store the formatted time string for display
          localTime.formattedTime = timezoneData.localTimeString;
          return localTime;
        }
      }
    } catch (error) {
      console.error("Error fetching timezone data:", error);
    }

    // Fallback to browser's local time if timezone API fails
    const now = new Date();
    return now;
  };

  const isNightTime = (date) => {
    // Use the formatted time if available, otherwise fall back to browser time
    if (date.formattedTime) {
      // Parse the formatted time string (e.g., "04:52 AM")
      const timeMatch = date.formattedTime.match(/(\d+):(\d+)\s*(AM|PM)/);
      if (timeMatch) {
        let hour = parseInt(timeMatch[1]);
        const period = timeMatch[3];

        // Convert to 24-hour format
        if (period === "PM" && hour !== 12) {
          hour += 12;
        } else if (period === "AM" && hour === 12) {
          hour = 0;
        }

        console.log("Debug - Parsed hour:", hour, "Period:", period);

        // Consider night time between 8 PM and 6 AM
        const isNight = hour >= 20 || hour < 6;
        console.log("Debug - Is Night (from formatted time):", isNight);
        return isNight;
      }
    }

    // Fallback to browser time
    const hour = date.getHours();
    const isNight = hour >= 20 || hour < 6;
    console.log("Debug - Is Night (from browser time):", isNight);
    return isNight;
  };

  const getLightPollutionLevel = async (lat, lng) => {
    try {
      // Fetch real light pollution data from our backend API
      const response = await fetch(
        `${API_BASE_URL}/api/light-pollution?lat=${lat}&lng=${lng}`,
      );

      if (!response.ok) {
        throw new Error(`Light pollution API error: ${response.status}`);
      }

      const lightPollutionData = await response.json();
      return lightPollutionData;
    } catch (error) {
      console.error("Error fetching light pollution data:", error);

      // Fallback to basic estimation if API fails
      const populationFactors = {
        high: {
          level: "High",
          description: "Heavy light pollution from city lights",
          factor: 0.3,
        },
        medium: {
          level: "Medium",
          description: "Moderate light pollution",
          factor: 0.6,
        },
        low: {
          level: "Low",
          description: "Minimal light pollution",
          factor: 0.9,
        },
      };

      // Simple fallback estimation
      const isMajorCity = Math.abs(lat) < 60 && Math.abs(lng) < 180;
      const isUrbanArea = Math.random() > 0.3; // Simplified logic

      if (isMajorCity && isUrbanArea) {
        return populationFactors.high;
      } else if (isUrbanArea) {
        return populationFactors.medium;
      } else {
        return populationFactors.low;
      }
    }
  };

  const analyzeStargazingConditions = async (lat, lng) => {
    try {
      // Get current time at the location
      const currentTime = await getCurrentTime(lat, lng);
      const isNight = isNightTime(currentTime);

      console.log(
        "Debug - Current Time:",
        currentTime.formattedTime || "No formatted time",
      );
      console.log("Debug - Is Night:", isNight);

      // Get light pollution data
      const lightPollution = await getLightPollutionLevel(lat, lng);

      // Get real weather data from OpenWeatherMap API
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/weather?lat=${lat}&lng=${lng}`,
        );
        if (!response.ok) {
          throw new Error(`Weather API error: ${response.status}`);
        }
        const weatherData = await response.json();

        // Determine if conditions are good for stargazing
        const isGoodCloudCover = weatherData.cloudCover < 30;
        const isGoodVisibility = weatherData.visibility > 10;
        const isGoodHumidity = weatherData.humidity < 70;
        const isGoodLightPollution = lightPollution.factor > 0.5;

        const isGoodForStargazing =
          isGoodCloudCover &&
          isGoodVisibility &&
          isGoodHumidity &&
          isGoodLightPollution;

        let recommendation = "";
        if (!isNight) {
          const timeString =
            currentTime.formattedTime ||
            currentTime.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            });
          recommendation = `It's ${timeString}. Current conditions for stargazing later tonight:`;
        } else if (isGoodForStargazing) {
          recommendation = "Excellent conditions for stargazing tonight!";
        } else {
          const issues = [];
          if (!isGoodCloudCover) issues.push("cloudy skies");
          if (!isGoodVisibility) issues.push("poor visibility");
          if (!isGoodHumidity) issues.push("high humidity");
          if (!isGoodLightPollution) issues.push("light pollution");

          // Show only the first two issues
          const displayIssues = issues.slice(0, 2);
          recommendation = `Stargazing isn't ideal - ${displayIssues.join(
            ", ",
          )}.`;
        }

        setStargazingPrediction({
          isGoodForStargazing: isNight ? isGoodForStargazing : false,
          recommendation,
          weatherData,
          factors: {
            cloudCover: isGoodCloudCover ? "Good" : "Poor",
            visibility: isGoodVisibility ? "Good" : "Poor",
            humidity: isGoodHumidity ? "Good" : "Poor",
            lightPollution: isGoodLightPollution ? "Good" : "Poor",
          },
          lightPollution: lightPollution,
          timeInfo: {
            currentTime:
              currentTime.formattedTime ||
              currentTime.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              }),
            isNightTime: isNight,
            nextSunset: "8:00 PM",
          },
        });
      } catch (weatherError) {
        console.error("Weather API error:", weatherError);
        // Fallback to basic analysis
        setStargazingPrediction({
          isGoodForStargazing: lightPollution.factor > 0.5,
          recommendation:
            lightPollution.factor > 0.5
              ? "Conditions may be suitable, but weather data unavailable."
              : `Light pollution is ${lightPollution.level.toLowerCase()}. Consider finding a darker location.`,
          weatherData: {
            cloudCover: 0,
            visibility: 0,
            humidity: 0,
            temperature: 0,
          },
          factors: {
            cloudCover: "Unknown",
            visibility: "Unknown",
            humidity: "Unknown",
            lightPollution: lightPollution.factor > 0.5 ? "Good" : "Poor",
          },
          lightPollution: lightPollution,
          timeInfo: {
            currentTime:
              currentTime.formattedTime ||
              currentTime.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              }),
            isNightTime: true,
            nextSunset: "8:00 PM",
          },
        });
      }
    } catch (error) {
      console.error("Error analyzing conditions:", error);
      setStargazingPrediction({
        isGoodForStargazing: false,
        recommendation: "Unable to analyze conditions. Please try again.",
        weatherData: {
          cloudCover: 0,
          visibility: 0,
          humidity: 0,
          temperature: 0,
        },
        factors: {
          cloudCover: "Unknown",
          visibility: "Unknown",
          humidity: "Unknown",
          lightPollution: "Unknown",
        },
        timeInfo: {
          currentTime: "Unknown",
          isNightTime: false,
          nextSunset: "Unknown",
        },
      });
    }
  };

  const geocodeLocation = async (city, country) => {
    try {
      const query = `${city}, ${country}`.replace(/\s+/g, "+");
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`,
      );
      const data = await response.json();

      if (data.length > 0) {
        return {
          latitude: parseFloat(data[0].lat),
          longitude: parseFloat(data[0].lon),
        };
      } else {
        throw new Error("Location not found");
      }
    } catch (error) {
      console.error("Geocoding error:", error);
      return null;
    }
  };

  const handleLocationSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const country = formData.get("country");
    const city = formData.get("city");

    // Show loading state
    setLoading(true);

    try {
      const coordinates = await geocodeLocation(city, country);

      if (coordinates) {
        setUserLocation({
          latitude: coordinates.latitude,
          longitude: coordinates.longitude,
          city: city,
          country: country,
        });
        analyzeStargazingConditions(
          coordinates.latitude,
          coordinates.longitude,
        );
        setShowLocationForm(false);
      } else {
        alert(
          "Location not found. Please check the city and country names and try again.",
        );
      }
    } catch (error) {
      console.error("Error geocoding location:", error);
      alert("Error finding location. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
      );
      const data = await response.json();

      if (data.display_name) {
        // Parse the display name to get city and country
        const parts = data.display_name.split(", ");
        const city = parts[0] || "Unknown City";
        const country = parts[parts.length - 1] || "Unknown Country";

        return { city, country };
      }
      return null;
    } catch (error) {
      console.error("Reverse geocoding error:", error);
      return null;
    }
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const lat = parseFloat(formData.get("latitude"));
    const lng = parseFloat(formData.get("longitude"));

    if (lat && lng) {
      // Show loading state
      setLoading(true);

      try {
        // Get place name from coordinates
        const placeInfo = await reverseGeocode(lat, lng);

        setUserLocation({
          latitude: lat,
          longitude: lng,
          city: placeInfo?.city,
          country: placeInfo?.country,
        });
        analyzeStargazingConditions(lat, lng);
        setShowManualForm(false);
      } catch (error) {
        console.error("Error processing coordinates:", error);
        // Still set location even if reverse geocoding fails
        setUserLocation({
          latitude: lat,
          longitude: lng,
        });
        analyzeStargazingConditions(lat, lng);
        setShowManualForm(false);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Animated stars */}
      <div className="fixed inset-0 z-0 pointer-events-none stars-zoom">
        {stars.map((star) => (
          <div
            key={star.id}
            style={{
              position: "absolute",
              left: `${star.left}%`,
              top: `${star.top}%`,
              width: "2px",
              height: "2px",
              background: "white",
              borderRadius: "50%",
              opacity: 0.8,
              animation: `twinkle 2s infinite ${star.delay}s alternate`,
            }}
          />
        ))}
      </div>

      {/* Header */}
      <header className="relative z-10 px-6 pt-2 flex justify-between items-start">
        <div>
          <h1
            className="text-4xl font-bold text-white font-mulish font-bold italic"
            style={{
              textShadow:
                "0 0 5px #fff, 0 0 10px #fff, 0 0 15px #fff, 0 0 20px #fff, 0 0 25px #fff, 0 0 30px rgba(102, 126, 234, 0.6)",
              letterSpacing: "0.05em",
            }}
          >
            Star Gazing Tonight
          </h1>
          <motion.p
            className="text-gray-300 text-lg sm:text-xl mb-4 star-glowy"
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              delay: 0.3,
              duration: 1.2,
              ease: "easeOut",
            }}
          >
            Will you be able to see the stars?
          </motion.p>
        </div>
        <div className="flex items-center space-x-4">
          <a
            href="https://github.com/anuragbhonsle/starune"
            target="_blank"
            rel="noopener noreferrer"
            className="
      flex items-center justify-center
      w-12 h-12
      bg-white/10 backdrop-blur-md border border-white/5
      rounded-full
      text-white
      hover:bg-white/20 hover:scale-110
      transition-all duration-300
      shadow-lg
    "
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
          </a>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 px-6 pt-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {/* Left Panel - Stargazing Prediction */}
          <div
            className="glass-panel rounded-lg p-4"
            style={{
              background: "transparent",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              borderRadius: "0.5rem",
              padding: "0.5rem",
            }}
          >
            <div className="mb-2">
              <h2
                className="text-2xl font-semibold text-white mb-4"
                style={{ marginTop: "0", paddingTop: "0" }}
              >
                Tonight's Prediction
              </h2>

              {/* Night sky image */}
              <div className="mb-4 rounded-lg overflow-hidden relative">
                <img
                  src="/abc.gif"
                  alt="Night sky with stars"
                  className="w-full rounded-lg"
                  style={{
                    width: "100%",
                    height: "220px",
                    objectFit: "cover",
                  }}
                />
              </div>

              {!userLocation ? (
                <div className="text-gray-300 text-center py-8">
                  <p>
                    Enter your location to get tonight's stargazing forecast
                  </p>
                </div>
              ) : stargazingPrediction ? (
                <div className="space-y-4">
                  <div
                    className={`text-center py-2 px-4 rounded-lg ${
                      stargazingPrediction.isGoodForStargazing
                        ? "bg-green-900/30 border border-green-500/30"
                        : "bg-red-900/30 border border-red-500/30"
                    }`}
                  >
                    <h3
                      className="text-lg font-semibold text-white"
                      style={{
                        margin: "0",
                        paddingTop: "8px",
                        paddingBottom: "8px",
                      }}
                    >
                      {stargazingPrediction.recommendation}
                    </h3>
                  </div>

                  <div className="grid grid-cols-4 gap-4">
                    <div
                      className="weather-metric rounded-lg p-3 text-center"
                      style={{
                        background: "rgba(255, 255, 255, 0.05)",
                        backdropFilter: "blur(10px)",
                        WebkitBackdropFilter: "blur(10px)",
                        border: "1px solid rgba(255, 255, 255, 0.15)",
                        borderRadius: "0.5rem",
                        padding: "0.1rem",
                        textAlign: "center",
                      }}
                    >
                      <div
                        className="text-sm text-gray-400"
                        style={{ margin: "0" }}
                      >
                        Cloud Cover
                      </div>
                      <div
                        className="text-white font-semibold"
                        style={{ margin: "0" }}
                      >
                        {stargazingPrediction.weatherData.cloudCover > 0
                          ? stargazingPrediction.weatherData.cloudCover.toFixed(
                              1,
                            ) + "%"
                          : "N/A"}
                      </div>
                      <div
                        className={`text-xs ${
                          stargazingPrediction.factors.cloudCover === "Good"
                            ? "text-green-400"
                            : stargazingPrediction.factors.cloudCover === "Poor"
                              ? "text-red-400"
                              : "text-gray-400"
                        }`}
                        style={{ margin: "0" }}
                      >
                        {stargazingPrediction.factors.cloudCover}
                      </div>
                    </div>
                    <div
                      className="weather-metric rounded-lg p-3 text-center"
                      style={{
                        background: "rgba(255, 255, 255, 0.05)",
                        backdropFilter: "blur(10px)",
                        WebkitBackdropFilter: "blur(10px)",
                        border: "1px solid rgba(255, 255, 255, 0.15)",
                        borderRadius: "0.5rem",
                        padding: "0.1rem",
                        textAlign: "center",
                      }}
                    >
                      <div
                        className="text-sm text-gray-400"
                        style={{ margin: "0" }}
                      >
                        Visibility
                      </div>
                      <div
                        className="text-white font-semibold"
                        style={{ margin: "0" }}
                      >
                        {stargazingPrediction.weatherData.visibility > 0
                          ? stargazingPrediction.weatherData.visibility.toFixed(
                              1,
                            ) + " km"
                          : "N/A"}
                      </div>
                      <div
                        className={`text-xs ${
                          stargazingPrediction.factors.visibility === "Good"
                            ? "text-green-400"
                            : stargazingPrediction.factors.visibility === "Poor"
                              ? "text-red-400"
                              : "text-gray-400"
                        }`}
                        style={{ margin: "0" }}
                      >
                        {stargazingPrediction.factors.visibility}
                      </div>
                    </div>
                    <div
                      className="weather-metric rounded-lg p-3 text-center"
                      style={{
                        background: "rgba(255, 255, 255, 0.05)",
                        backdropFilter: "blur(10px)",
                        WebkitBackdropFilter: "blur(10px)",
                        border: "1px solid rgba(255, 255, 255, 0.15)",
                        borderRadius: "0.5rem",
                        padding: "0.1rem",
                        textAlign: "center",
                      }}
                    >
                      <div
                        className="text-sm text-gray-400"
                        style={{ margin: "0" }}
                      >
                        Humidity
                      </div>
                      <div
                        className="text-white font-semibold"
                        style={{ margin: "0" }}
                      >
                        {stargazingPrediction.weatherData.humidity > 0
                          ? stargazingPrediction.weatherData.humidity.toFixed(
                              1,
                            ) + "%"
                          : "N/A"}
                      </div>
                      <div
                        className={`text-xs ${
                          stargazingPrediction.factors.humidity === "Good"
                            ? "text-green-400"
                            : stargazingPrediction.factors.humidity === "Poor"
                              ? "text-red-400"
                              : "text-gray-400"
                        }`}
                        style={{ margin: "0" }}
                      >
                        {stargazingPrediction.factors.humidity}
                      </div>
                    </div>
                    <div
                      className="weather-metric rounded-lg p-3 text-center"
                      style={{
                        background: "rgba(255, 255, 255, 0.05)",
                        backdropFilter: "blur(10px)",
                        WebkitBackdropFilter: "blur(10px)",
                        border: "1px solid rgba(255, 255, 255, 0.15)",
                        borderRadius: "0.5rem",
                        padding: "0.1rem",
                        textAlign: "center",
                      }}
                    >
                      <div
                        className="text-sm text-gray-400"
                        style={{ margin: "0" }}
                      >
                        Light Pollution
                      </div>
                      <div
                        className="text-white font-semibold"
                        style={{ margin: "0" }}
                      >
                        {stargazingPrediction.lightPollution
                          ? stargazingPrediction.lightPollution.level
                          : "N/A"}
                      </div>
                      <div
                        className={`text-xs ${
                          stargazingPrediction.factors.lightPollution === "Good"
                            ? "text-green-400"
                            : stargazingPrediction.factors.lightPollution ===
                                "Poor"
                              ? "text-red-400"
                              : "text-gray-400"
                        }`}
                        style={{ margin: "0" }}
                      >
                        {stargazingPrediction.factors.lightPollution}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-gray-300 text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
                  <p>Analyzing conditions...</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Location Input */}
          <div
            className="glass-panel rounded-lg p-4"
            style={{
              background: "transparent",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              borderRadius: "0.5rem",
              padding: "0.5rem",
            }}
          >
            <div className="mb-2">
              <div
                className="border border-white/30 rounded-lg p-4 mb-2"
                style={{
                  background: "transparent",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  borderRadius: "0.5rem",
                  padding: "0.5rem",
                  marginBottom: "1rem",
                }}
              >
                <p className="text-sm text-white" style={{ margin: "0" }}>
                  Note: Your location is private. All calculations happen
                  directly on your device. Your location is never sent to any
                  server.
                </p>
              </div>

              <div className="space-y-3.5 flex flex-col items-center">
                <button
                  onClick={detectLocation}
                  className="glass-button px-8 py-3 text-lg"
                  onMouseEnter={() => setHoveredButton("detect")}
                  onMouseLeave={() => setHoveredButton(null)}
                >
                  Detect My Location
                </button>

                <div className="text-center text-gray-400 text-sm">OR</div>

                <button
                  onClick={dropOnMap}
                  className="glass-button px-8 py-3 text-lg"
                  onMouseEnter={() => setHoveredButton("city")}
                  onMouseLeave={() => setHoveredButton(null)}
                >
                  Enter City & Country
                </button>

                <div className="text-center text-gray-400 text-sm">OR</div>

                <button
                  onClick={enterManually}
                  className="glass-button px-8 py-3 text-lg"
                  onMouseEnter={() => setHoveredButton("coords")}
                  onMouseLeave={() => setHoveredButton(null)}
                >
                  Enter Coordinates
                </button>
              </div>
            </div>

            {userLocation && (
              <div
                className="mt-6 p-4 bg-green-900/30 border border-green-500/30 rounded-lg"
                style={{
                  marginTop: "0.5rem",
                  padding: "0.5rem",
                  background: "rgba(20, 83, 45, 0.3)",
                  border: "1px solid rgba(34, 197, 94, 0.15)",
                  borderRadius: "0.5rem",
                }}
              >
                <div className="text-green-300 text-sm">
                  <div className="text-green-200 font-semibold mb-1">
                    Your Location
                  </div>
                  <div className="text-xs">
                    {userLocation.latitude.toFixed(4)}°,{" "}
                    {userLocation.longitude.toFixed(4)}°
                    {userLocation.city && (
                      <span>
                        {" "}
                        • {userLocation.city}, {userLocation.country}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Time Information */}
            {stargazingPrediction && stargazingPrediction.timeInfo && (
              <div
                className="mt-4 p-4 bg-blue-900/30 border border-blue-500/30 rounded-lg"
                style={{
                  marginTop: "0.5rem",
                  padding: "0.5rem",
                  background: "rgba(30, 58, 138, 0.3)",
                  border: "1px solid rgba(59, 130, 246, 0.3)",
                  borderRadius: "0.5rem",
                }}
              >
                <div className="text-blue-200 text-sm">
                  <div className="text-blue-100 font-semibold mb-1">
                    Current Time: {stargazingPrediction.timeInfo.currentTime}
                  </div>
                  <div className="text-xs">
                    {stargazingPrediction.timeInfo.isNightTime
                      ? "Night time - stars should be visible"
                      : "Day time - stars not visible"}
                  </div>
                  <div className="text-xs text-blue-300 mt-1">
                    Time shown is local time for the selected location
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Location Form Modal */}
      {showLocationForm && (
        <div className="fixed inset-0 modal-backdrop flex items-center justify-center z-50">
          <div className="prediction-card rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold text-white mb-4">
              Enter Your Location
            </h3>
            <form onSubmit={handleLocationSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Country
                </label>
                <input
                  type="text"
                  name="country"
                  required
                  className="w-full form-input rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none"
                  placeholder="e.g., USA, Canada, UK"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  required
                  className="w-full form-input rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none"
                  placeholder="e.g., New York, Toronto, London"
                />
              </div>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="flex-1 glass-button text-white py-2 px-4 rounded-lg font-medium"
                >
                  Submit
                </button>

                <button
                  type="button"
                  onClick={() => setShowLocationForm(false)}
                  className="glass-button flex-1 text-white px-8 py-3 text-lg rounded-lg transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manual Coordinates Form Modal */}
      {showManualForm && (
        <div className="fixed inset-0 modal-backdrop flex items-center justify-center z-50">
          <div className="prediction-card rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold text-white mb-4">
              Enter Coordinates
            </h3>
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Latitude
                </label>
                <input
                  type="number"
                  name="latitude"
                  step="any"
                  required
                  className="w-full form-input rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none"
                  placeholder="e.g., 40.7128"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Longitude
                </label>
                <input
                  type="number"
                  name="longitude"
                  step="any"
                  required
                  className="w-full form-input rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none"
                  placeholder="e.g., -74.0060"
                />
              </div>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="glass-button flex-1 text-white px-8 py-3 text-lg rounded-lg transition-all"
                >
                  Submit
                </button>

                <button
                  type="button"
                  onClick={() => setShowManualForm(false)}
                  className="glass-button flex-1 text-white px-8 py-3 text-lg rounded-lg transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
