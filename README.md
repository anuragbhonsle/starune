# 🌟 Star Gazing Tonight

Ever wondered if you can see the stars tonight? This app tells you exactly that! Just enter your location and get a real-time forecast for stargazing conditions.

## ✨ What it does

### 🌍 **Find Your Location**

- **Auto-detect**: Uses your phone's GPS to find where you are
- **Search by city**: Type any city and country (like "Tokyo, Japan")
- **Manual coordinates**: If you know your exact lat/lng, just type them in

### 🌤️ **Check the Weather**

- **Cloud cover**: How cloudy is it? (Less clouds = better stargazing)
- **Visibility**: How far can you see? (Clearer air = better stars)
- **Humidity**: How humid is it? (Less humidity = clearer skies)
- **Light pollution**: How bright are the city lights? (Darker = better)

### ⏰ **Smart Time Check**

- **Accurate local time**: Shows the actual time for the selected location
- **Timezone-aware**: Automatically detects timezone based on coordinates
- **Global coverage**: Supports 30+ major cities and regions worldwide
- **Daytime**: "It's 2:30 PM. Stars appear after sunset, around 8 PM."
- **Nighttime**: Full analysis of stargazing conditions

## 🚀 Getting Started

### What you need

- Node.js (version 16 or newer)
- npm (comes with Node.js)

### Setup

1. **Download the code**

   ```bash
   git clone https://github.com/anuragbhonsle/starune.git
   cd starune
   ```

2. **Install the stuff**

   ```bash
   # Frontend stuff
   cd frontend
   npm install

   # Backend stuff
   cd ../backend
   npm install
   ```

3. **Run it**

   ```bash
   # Start the backend (from backend folder)
   npm start

   # Start the frontend (from frontend folder)
   npm run dev
   ```

4. **Open your browser**
   - Go to: http://localhost:5173
   - Backend runs on: http://localhost:5000

## 🛠️ Built With

### Frontend

- **React 18** - Makes the UI interactive
- **Vite** - Makes it fast to develop
- **Tailwind CSS** - Makes it look pretty
- **OpenStreetMap** - Free location services

### Backend

- **Node.js** - Runs the server
- **Express.js** - Handles web requests
- **CORS** - Lets frontend talk to backend
- **OpenWeatherMap API** - Real-time weather data
- **Light Pollution Algorithm** - Sophisticated estimation based on geographic patterns

## 📱 How to Use

1. **Pick how to find your location**:

   - **"Detect My Location"** - Uses your GPS (easiest!)
   - **"Enter City & Country"** - Type any city (like "London, UK")
   - **"Enter Coordinates"** - If you know lat/lng

2. **See your forecast**:

   - **During day**: Shows current time and when stars appear
   - **At night**: Shows if conditions are good for stargazing
   - **Metrics**: Cloud cover, visibility, humidity, light pollution

3. **Understand the results**:
   - **Green box**: Great conditions for stargazing!
   - **Red box**: Not ideal (tells you why)
   - **Numbers**: See the actual weather data

## 🌟 Cool Features

### Location Stuff

- **Forward geocoding**: Type "Paris, France" → gets coordinates
- **Reverse geocoding**: Enter coordinates → shows "Paris, France"
- **Free service**: Uses OpenStreetMap (no API keys needed!)

### Weather Analysis

- **Real data**: Gets actual weather conditions from OpenWeatherMap API
- **Real light pollution data**: Uses sophisticated algorithms based on known city patterns and geographic features
- **Smart recommendations**: Tells you exactly what's wrong
- **Multiple factors**: Checks everything that affects stargazing

## 🎨 Design Stuff

### Glassmorphism

- **See-through panels**: Modern glass look
- **Blur effects**: Fancy visual stuff
- **Thin borders**: Elegant and clean

### Animations

- **150 animated stars**: Moving stars in the background
- **Hover effects**: Buttons move when you hover
- **Smooth transitions**: Everything flows nicely

## 📊 Performance

- **Stars generated once**: Doesn't recreate them every time
- **Fast loading**: Optimized for speed
- **Smooth animations**: 60fps star movement
- **Smart caching**: Reduces API calls

## 🔧 Customization

### Environment Variables

```env
# Backend
PORT=5000
CORS_ORIGIN=http://localhost:5173

# Frontend
VITE_API_URL=http://localhost:5000
```

### Easy Changes

- **Star count**: Change `150` in the code for more/fewer stars
- **Glow effects**: Adjust the text-shadow values
- **Colors**: Update CSS for different themes

## 🚀 Deploying

### Frontend (Vercel/Netlify)

```bash
cd frontend
npm run build
# Upload the 'dist' folder
```

### Backend (Railway/Heroku)

```bash
cd backend
# Set your environment variables
npm start
```

## 🤝 Want to Help?

1. Fork the repo
2. Make your changes
3. Submit a pull request

## 📝 License

MIT License - feel free to use this code!

## 🙏 Thanks

- **OpenStreetMap** for free location services
- **React community** for the amazing framework
- **Tailwind CSS** for making it look good

## 📞 Need Help?

- Open an issue on GitHub
- Check the code comments
- Look at the documentation

---

**Made for stargazers everywhere** ❤️

⭐ **Star this repo if you like it!**
