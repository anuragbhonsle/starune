# 🌟 Star Gazing Tonight

A beautiful, real-time stargazing forecast application that tells you whether you can see the stars tonight based on your location, weather conditions, and light pollution levels.

![Star Gazing Tonight](https://img.shields.io/badge/Status-Live-brightgreen)
![React](https://img.shields.io/badge/React-18.0-blue)
![Node.js](https://img.shields.io/badge/Node.js-16+-green)

## ✨ Features

### 🌍 **Location Detection**
- **Auto-detect**: Uses browser geolocation for instant location detection
- **City/Country Search**: Enter any city and country for accurate coordinates
- **Manual Coordinates**: Input precise latitude/longitude coordinates
- **Reverse Geocoding**: Shows place names for all location methods

### 🌤️ **Weather Analysis**
- **Cloud Cover**: Analyzes cloud coverage for optimal stargazing
- **Visibility**: Checks atmospheric visibility conditions
- **Humidity**: Monitors humidity levels affecting star visibility
- **Light Pollution**: Estimates light pollution based on location

### ⏰ **Time-Aware**
- **Day/Night Detection**: Automatically detects if it's night time
- **Local Time**: Shows current time at your location
- **Smart Messages**: "It's 2:30 PM. Stars appear after sunset, around 8 PM."

### 🎨 **Beautiful UI**
- **Glassmorphism Design**: Modern translucent glass panels
- **Animated Stars**: 150 animated stars in the background
- **Responsive**: Works perfectly on desktop and mobile
- **Dark Theme**: Perfect for stargazing aesthetics

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/star-gazing-tonight.git
   cd star-gazing-tonight
   ```

2. **Install dependencies**
   ```bash
   # Install frontend dependencies
   cd frontend
   npm install
   
   # Install backend dependencies
   cd ../backend
   npm install
   ```

3. **Start the development servers**
   ```bash
   # Start backend server (from backend directory)
   npm start
   
   # Start frontend server (from frontend directory)
   npm run dev
   ```

4. **Open your browser**
   - Frontend: http://localhost:5173
   - Backend: http://localhost:5000

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern UI framework
- **Vite** - Fast build tool
- **Tailwind CSS** - Utility-first CSS framework
- **OpenStreetMap Nominatim** - Free geocoding API

### Backend
- **Node.js** - Server runtime
- **Express.js** - Web framework
- **CORS** - Cross-origin resource sharing

## 📱 How to Use

1. **Choose Your Location Method**:
   - **Detect My Location**: Automatic GPS detection
   - **Enter City & Country**: Type any city and country
   - **Enter Coordinates**: Manual latitude/longitude input

2. **Get Your Forecast**:
   - **Daytime**: Shows current time and sunset reminder
   - **Nighttime**: Displays comprehensive stargazing conditions
   - **Weather Metrics**: Cloud cover, visibility, humidity, light pollution

3. **Understand the Results**:
   - **Green**: Excellent conditions for stargazing
   - **Red**: Conditions not ideal (with specific reasons)
   - **Metrics**: Detailed breakdown of each factor

## 🌟 API Features

### Geocoding
- **Forward Geocoding**: Convert city names to coordinates
- **Reverse Geocoding**: Convert coordinates to place names
- **Free Service**: Uses OpenStreetMap Nominatim API

### Weather Analysis
- **Real-time Data**: Current weather conditions
- **Multiple Factors**: Cloud cover, visibility, humidity
- **Smart Recommendations**: Specific advice based on conditions

## 🎨 Design Features

### Glassmorphism
- **Translucent Panels**: Modern glass-like appearance
- **Backdrop Blur**: Sophisticated visual effects
- **Subtle Borders**: Elegant thin borders throughout

### Animations
- **Star Animation**: 150 animated stars in background
- **Hover Effects**: Interactive button animations
- **Smooth Transitions**: Fluid user experience

## 📊 Performance Optimizations

- **Memoized Star Generation**: Stars generated once, not on every render
- **Lazy Loading**: Efficient component loading
- **Optimized Animations**: Smooth 60fps animations
- **Reduced API Calls**: Smart caching and error handling

## 🔧 Configuration

### Environment Variables
```env
# Backend
PORT=5000
CORS_ORIGIN=http://localhost:5173

# Frontend
VITE_API_URL=http://localhost:5000
```

### Customization
- **Star Count**: Modify `150` in star generation for performance
- **Glow Effects**: Adjust text-shadow values for different glow intensities
- **Colors**: Update CSS variables for custom themes

## 🚀 Deployment

### Frontend (Vercel/Netlify)
```bash
cd frontend
npm run build
# Deploy dist folder
```

### Backend (Railway/Heroku)
```bash
cd backend
# Set environment variables
npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **OpenStreetMap**: Free geocoding services
- **React Community**: Amazing framework and ecosystem
- **Tailwind CSS**: Beautiful utility-first CSS framework

## 📞 Support

If you have any questions or need help:
- Open an issue on GitHub
- Check the documentation
- Review the code comments

---

**Made with ❤️ for stargazers everywhere**

⭐ **Star this repository if you find it helpful!** 