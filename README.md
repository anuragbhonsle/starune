<a href="https://git.io/typing-svg">
  <img src="https://readme-typing-svg.herokuapp.com?font=Plus+Jakarta+Sans&size=40&duration=5000&pause=5000&color=FFFFFF&width=700&height=60&lines=Starune" />
</a>

Starune is a stargazing forecast application, check sky visibility, cloud cover, and atmospheric conditions in real time to plan your night under the stars.
Built with React, Vite, Tailwind CSS, and an Express backend, it processes live meteorological and location data to determine ideal stargazing windows.

## Live Demo: [starune.vercel.app](https://starune.vercel.app/)

## Features

* **Flexible location support** — auto-detect location via GPS, search by city/country, or enter custom latitude/longitude
* **Astronomical conditions tracking** — real-time data for cloud cover, visibility distance, humidity, and light pollution estimation
* **Day/Night & time awareness** — local time display and automatic solar state calculation for accurate nighttime feedback
* **Smart forecast logic** — condition evaluation to give a clear verdict on night sky clarity
* **Full-stack architecture** — separate frontend client and standalone Express API service

## Tech Stack

* **Frontend:** [React](https://react.dev/) + [Vite](https://vitejs.dev/)
* **Backend:** Node.js + [Express](https://expressjs.com/)
* **Styling:** Tailwind CSS, dark night-sky theme
* **APIs:**

  * [OpenWeatherMap API](https://openweathermap.org/) — weather metrics, cloud cover, visibility
  * [OpenStreetMap Nominatim](https://nominatim.openstreetmap.org/) — forward and reverse geocoding
* **Deployment:** Vercel (Frontend) + Render (Backend)

## Getting Started

### Prerequisites

* Node.js 18+
* npm or yarn
* OpenWeatherMap API key

### Installation

```bash
git clone https://github.com/anuragbhonsle/starune.git
cd starune
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```env
# OpenWeatherMap API
OPENWEATHER_API_KEY=your_api_key_here

# Backend API URL (for local dev or production)
VITE_API_BASE_URL=http://localhost:5000
```

### Run the Development Server

Start the backend server:

```bash
npm run server
```

Start the frontend client in a separate terminal:

```bash
npm run dev
```

Open http://localhost:5173 to view the app in your browser.

## Project Structure

```text
├── src/
│   ├── assets/           # Dynamic graphics and night sky icons
│   ├── components/       # Weather cards, search input, and location selectors
│   ├── hooks/            # Custom React hooks for geolocation and API fetching
│   ├── services/         # Axios API clients for OpenWeatherMap & Nominatim
│   └── App.jsx           # Main forecast dashboard layout
├── server/
│   ├── index.js          # Express server entry point
│   └── routes/           # Weather and geocoding proxy routes
└── public/               # Static assets and favicon
```

## Architecture & Deployment

Starune is fully deployed and decoupled across production environments:

* **Frontend:** Hosted on Vercel for fast static delivery and continuous integration.
* **Backend:** Hosted on Render as an independent Express API service.


## Contributing

Contributions, issues, and feature requests are welcome. Feel free to open an issue or submit a pull request.

## License

Distributed under the MIT License. See LICENSE for more information.
