import { useState, useEffect, useMemo } from "react";

import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import FlipWords from "./components/FlipWords";
function App() {
  const VITE_API_URL = import.meta.env.VITE_API_URL;
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
    const colors = ["#ffffff", "#dbeafe", "#fde68a", "#f5f3ff"];
    for (let i = 0; i < 150; i++) {
      starArray.push({
        id: i,
        left: -50 + Math.random() * 200,
        top: Math.random() * 100,
        delay: Math.random() * 6,
        size:
          Math.random() < 0.9 ? Math.random() * 1 + 1 : Math.random() * 1 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        glow: Math.random() > 0.4,
      });
    }
    return starArray;
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
        `${VITE_API_URL}/api/timezone?lat=${lat}&lng=${lng}`,
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
        `${VITE_API_URL}/api/light-pollution?lat=${lat}&lng=${lng}`,
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
          `${VITE_API_URL}/api/weather?lat=${lat}&lng=${lng}`,
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
              width: `${star.size}px`,
              height: `${star.size}px`,
              backgroundColor: star.color,
              borderRadius: "50%",
              opacity: 1,
              animation: `twinkle 2s infinite ${star.delay}s alternate`,
            }}
          />
        ))}
      </div>

      {/* Header */}
      <header className="relative z-10 px-4 sm:px-6 pt-4 sm:pt-2 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mt-5 mb-10">
        <div>
          <h1 className="font-bold text-white leading-tight text-2xl sm:text-2xl lg:text-3xl tracking-wider mb-4">
            Star{" "}
            <FlipWords
              words={["Gazing", "Watching", "Tracking", "Exploring"]}
              duration={5000}
              className="text-white"
            />
            Tonight
          </h1>
          <motion.p
            className="text-white/80 text-base sm:text-lg mb-2 sm:mb-4"
            initial={{ opacity: 0, y: 7, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              delay: 0.3,
              duration: 0.5,
              ease: "easeOut",
            }}
          >
            Stargazing Forecast - Will you be able to see the stars tonight?
          </motion.p>
        </div>
        <div className="flex items-center justify-center">
          <Link
            to="/about"
            className="text-md text-white/70 hover:text-white underline underline-offset-4 tracking-wide transition-colors cursor-pointer"
          >
            About
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 px-4 sm:px-6 pt-2 pb-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 max-w-7xl mx-auto">
          {/* Left Panel - Stargazing Prediction */}
          <div className="glass-panel p-4">
            <h2 className="text-xl sm:text-2xl font-semibold text-white mb-3">
              Tonight's Prediction
            </h2>

            {/* Night sky image */}
            <div className="mb-4 rounded-lg overflow-hidden">
              <img
                src="/abc.gif"
                alt="Night sky with stars"
                className="w-full h-[180px] sm:h-[220px] object-cover rounded-lg saturate-140 contrast-135 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)] transition-all duration-500 hover:saturate-170 hover:contrast-170  hover:scale-103"
              />
            </div>

            {!userLocation ? (
              <div className="text-gray-300 text-center py-8">
                <p>Enter your location to get tonight's stargazing forecast</p>
              </div>
            ) : stargazingPrediction ? (
              <div className="space-y-4">
                <div
                  className={`text-center py-2 px-4 rounded-lg border ${
                    stargazingPrediction.isGoodForStargazing
                      ? "recommendation border-white/20"
                      : "recommendation border-white/20"
                  }`}
                >
                  <h3 className="text-base sm:text-lg font-semibold text-white py-1">
                    {stargazingPrediction.recommendation}
                  </h3>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                  <div className="weather-metric rounded-lg p-2.5 sm:p-3">
                    <div className="text-xs sm:text-sm text-gray-400">
                      Cloud Cover
                    </div>
                    <div className="text-white font-semibold text-sm sm:text-base">
                      {stargazingPrediction.weatherData.cloudCover > 0
                        ? stargazingPrediction.weatherData.cloudCover.toFixed(
                            1,
                          ) + "%"
                        : "N/A"}
                    </div>
                    <div
                      className={`text-xs ${
                        stargazingPrediction.factors.cloudCover === "Good"
                          ? "text-white/80"
                          : stargazingPrediction.factors.cloudCover === "Poor"
                            ? "text-red-400"
                            : "text-gray-400"
                      }`}
                    >
                      {stargazingPrediction.factors.cloudCover}
                    </div>
                  </div>

                  <div className="weather-metric rounded-lg p-2.5 sm:p-3">
                    <div className="text-xs sm:text-sm text-gray-400">
                      Visibility
                    </div>
                    <div className="text-white font-semibold text-sm sm:text-base">
                      {stargazingPrediction.weatherData.visibility > 0
                        ? stargazingPrediction.weatherData.visibility.toFixed(
                            1,
                          ) + " km"
                        : "N/A"}
                    </div>
                    <div
                      className={`text-xs ${
                        stargazingPrediction.factors.visibility === "Good"
                          ? "text-white/80"
                          : stargazingPrediction.factors.visibility === "Poor"
                            ? "text-red-400"
                            : "text-gray-400"
                      }`}
                    >
                      {stargazingPrediction.factors.visibility}
                    </div>
                  </div>

                  <div className="weather-metric rounded-lg p-2.5 sm:p-3">
                    <div className="text-xs sm:text-sm text-gray-400">
                      Humidity
                    </div>
                    <div className="text-white font-semibold text-sm sm:text-base">
                      {stargazingPrediction.weatherData.humidity > 0
                        ? stargazingPrediction.weatherData.humidity.toFixed(1) +
                          "%"
                        : "N/A"}
                    </div>
                    <div
                      className={`text-xs ${
                        stargazingPrediction.factors.humidity === "Good"
                          ? "text-white/80"
                          : stargazingPrediction.factors.humidity === "Poor"
                            ? "text-red-400"
                            : "text-gray-400"
                      }`}
                    >
                      {stargazingPrediction.factors.humidity}
                    </div>
                  </div>

                  <div className="weather-metric rounded-lg p-2.5 sm:p-3">
                    <div className="text-xs sm:text-sm text-gray-400">
                      Light Pollution
                    </div>
                    <div className="text-white font-semibold text-sm sm:text-base">
                      {stargazingPrediction.lightPollution
                        ? stargazingPrediction.lightPollution.level
                        : "N/A"}
                    </div>
                    <div
                      className={`text-xs ${
                        stargazingPrediction.factors.lightPollution === "Good"
                          ? "text-white/80"
                          : stargazingPrediction.factors.lightPollution ===
                              "Poor"
                            ? "text-red-400"
                            : "text-gray-400"
                      }`}
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

          {/* Right Panel - Location Input */}
          <div className="glass-panel p-4">
            <div className="border border-white/15 rounded-lg p-3 mb-4">
              <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
                Note: Your location is used only to fetch weather and sky data.
                Coordinates are sent to OpenWeatherMap API but are never stored
                or tracked by this app.
              </p>
            </div>

            <div className="space-y-1 flex flex-col items-center">
              <button
                onClick={detectLocation}
                className="glass-button w-full sm:w-3/5 sm:max-w-[300px] px-6 py-2.5 sm:py-3 text-sm sm:text-base md:text-sm lg:text-md rounded-full"
                onMouseEnter={() => setHoveredButton("detect")}
                onMouseLeave={() => setHoveredButton(null)}
              >
                Detect My Location
              </button>

              <div className="text-center text-gray-400 text-sm">OR</div>

              <button
                onClick={dropOnMap}
                className="glass-button w-full sm:w-3/5 sm:max-w-[300px] px-6 py-2.5 sm:py-3 text-sm sm:text-basemd:text-sm lg:text-md rounded-full"
                onMouseEnter={() => setHoveredButton("city")}
                onMouseLeave={() => setHoveredButton(null)}
              >
                Enter City & Country
              </button>

              <div className="text-center text-gray-400 text-sm">OR</div>

              <button
                onClick={enterManually}
                className="glass-button w-full sm:w-3/5 sm:max-w-[300px] px-6 py-2.5 sm:py-3 text-sm sm:text-base md:text-sm lg:text-md rounded-full"
                onMouseEnter={() => setHoveredButton("coords")}
                onMouseLeave={() => setHoveredButton(null)}
              >
                Enter Coordinates
              </button>
            </div>

            {userLocation && (
              <div className="mt-4 p-3 bg-transperent border border-white/20 rounded-lg">
                <div className="text-white text-sm font-semibold mb-1">
                  Your Location
                </div>
                <div className="text-xs text-white/70">
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
            )}

            {/* Time Information */}
            {stargazingPrediction && stargazingPrediction.timeInfo && (
              <div className="mt-3 p-3 bg-transperent border border-white/20 rounded-lg">
                <div className="text-white text-sm font-semibold mb-1">
                  Current Time: {stargazingPrediction.timeInfo.currentTime}
                </div>
                <div className="text-xs text-white/70">
                  {stargazingPrediction.timeInfo.isNightTime
                    ? "Night time - stars should be visible"
                    : "Day time - stars not visible"}
                </div>
                <div className="text-xs text-white/70 mt-1">
                  Time shown is local time for the selected location
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Location Form Modal */}
      {showLocationForm && (
        <div className="modal-backdrop">
          <div className="prediction-card">
            <h3 className="text-xl font-semibold text-white mb-4">
              Enter Your Location
            </h3>
            <form onSubmit={handleLocationSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1.5">
                  Country
                </label>
                <input
                  type="text"
                  name="country"
                  required
                  className="form-input w-full rounded-full px-4 py-2.5"
                  placeholder="e.g., USA, Canada, UK"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1.5">
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  required
                  className="form-input w-full rounded-full px-4 py-2.5"
                  placeholder="e.g., New York, Toronto, London"
                />
              </div>
              <div className="flex gap-3 pt-1">
                <button
                  type="submit"
                  className="glass-button flex-1 py-2.5 px-4 text-base  rounded-full"
                >
                  Submit
                </button>
                <button
                  type="button"
                  onClick={() => setShowLocationForm(false)}
                  className="flex-1 border border-white/20 text-white py-2.5 px-4 rounded-2xl font-medium hover:bg-white/10 transition-all rounded-full"
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
        <div className="modal-backdrop">
          <div className="prediction-card">
            <h3 className="text-xl font-semibold text-white mb-4">
              Enter Coordinates
            </h3>
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1.5">
                  Latitude
                </label>
                <input
                  type="number"
                  name="latitude"
                  step="any"
                  required
                  className="form-input w-full rounded-full px-4 py-2.5 "
                  placeholder="e.g., 40.7128"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1.5">
                  Longitude
                </label>
                <input
                  type="number"
                  name="longitude"
                  step="any"
                  required
                  className="form-input w-full rounded-full px-4 py-2.5"
                  placeholder="e.g., -74.0060"
                />
              </div>
              <div className="flex gap-3 pt-1">
                <button
                  type="submit"
                  className="glass-button flex-1 py-2.5 px-4 text-base rounded-full"
                >
                  Submit
                </button>
                <button
                  type="button"
                  onClick={() => setShowManualForm(false)}
                  className="flex-1 border border-white/20 text-white py-2.5 px-4 rounded-2xl font-medium hover:bg-white/10 transition-all rounded-full"
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
