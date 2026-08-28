import { useMemo } from "react";
import { IconBrandGithub, IconBrandX, IconWorld } from "@tabler/icons-react";

export default function About() {
  const stars = useMemo(() => {
    const starArray = [];
    const colors = [
      "#ffffff", // white
      "#dbeafe", // blue-white
      "#fde68a", // yellow-white
      "#f5f3ff", // slightly purple-white
    ];
    for (let i = 0; i < 150; i++) {
      starArray.push({
        id: i,
        left: -50 + Math.random() * 200,
        top: Math.random() * 100,
        delay: Math.random() * 6,
        size:
          Math.random() < 0.9 ? Math.random() * 1 + 1 : Math.random() * 2 + 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        glow: Math.random() > 0.4,
      });
    }
    return starArray;
  }, []);

  return (
    <div className="min-h-screen bg-black relative overflow-hidden text-white">
      {/* Animated stars background */}
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
              boxShadow: star.glow ? `0 0 10px ${star.color}` : "none",
            }}
          />
        ))}
      </div>

      {/* Main content container with z-index to stay above background */}
      <div className="relative z-10 mx-auto w-full max-w-3xl px-4 sm:px-6 py-10 sm:py-14">
        {/* Project Overview */}
        <section className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-4">
            About Starune
          </h1>
          <div className="glass-panel p-5">
            <p className="text-sm leading-relaxed text-white/80 mb-4">
              <span className="font-bold text-white">Starune</span> helps you
              check if the sky is clear enough for stargazing at your location.
              Enter your coordinates or search by city, and it will deliver
              real-time weather and visibility data to help plan your night
              under the stars.
            </p>
          </div>
        </section>

        {/* Core Features */}
        <section className="mb-6">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-white mb-3">
            Key Features
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="glass-panel p-4">
              <h3 className="font-semibold text-white text-sm mb-1">
                Location Support
              </h3>
              <p className="text-white/70 text-xs leading-relaxed">
                Auto-detect via GPS, search by city/country, or input latitude
                and longitude manually.
              </p>
            </div>
            <div className="glass-panel p-4">
              <h3 className="font-semibold text-white text-sm mb-1">
                Forecast Details
              </h3>
              <p className="text-white/70 text-xs leading-relaxed">
                Real-time telemetry on cloud cover percentage, visibility
                distance, humidity levels, and light pollution estimates.
              </p>
            </div>
            <div className="glass-panel p-4">
              <h3 className="font-semibold text-white text-sm mb-1">
                Time Awareness
              </h3>
              <p className="text-white/70 text-xs leading-relaxed">
                Local time display with day/night detection for accurate
                stargazing condition feedback.
              </p>
            </div>
          </div>
        </section>

        {/* Architecture & Tech Stack */}
        <section className="mb-6">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-white mb-3">
            Tech Stack &amp; APIs
          </h2>
          <div className="glass-panel p-5 text-sm leading-relaxed space-y-3">
            <p className="text-white/80">
              <span className="font-semibold text-white">Frontend:</span> React,
              Vite, Tailwind CSS
            </p>
            <p className="text-white/80">
              <span className="font-semibold text-white">Backend:</span>{" "}
              Node.js, Express, Axios
            </p>
            <p className="text-white/80">
              <span className="font-semibold text-white">External APIs:</span>{" "}
              OpenWeatherMap (atmospheric data) &amp; OpenStreetMap Nominatim
              (geocoding)
            </p>
            <div className="pt-3 border-t border-white/10 text-xs text-white/60">
              <span className="font-semibold text-white/80">
                Production Setup:
              </span>{" "}
              Frontend deployed on Vercel, Node.js backend hosted on Render.
            </div>
          </div>
        </section>

        {/* About Me */}
        <section className="mb-6">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-white mb-3">
            About Me
          </h2>
          <div className="glass-panel p-5">
            <p className="text-sm leading-relaxed text-white/80">
              Hey, I'm <span className="font-semibold text-white">Anurag</span>{" "}
              - I built Starune to solve a real-world problem for stargazing
              enthusiasts by aggregating key atmospheric metrics into a clean
              visual UI. Always building side projects, refining UI details, and
              optimizing backend logic.
            </p>
          </div>
        </section>

        {/* Social Links */}
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-widest text-white mb-3">
            Find Me On
          </h2>
          <div className="glass-panel p-5">
            <div className="flex flex-row items-center justify-center gap-4 sm:gap-6">
              <a
                href="https://github.com/anuragbhonsle"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-white hover:border-white hover:text-white hover:scale-105 transition-all duration-300"
                aria-label="GitHub Profile"
              >
                <IconBrandGithub className="h-5 w-5" />
              </a>
              <a
                href="https://x.com/Anuraaaag7"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-white hover:border-white hover:text-white hover:scale-105 transition-all duration-300"
                aria-label="X (Twitter) Profile"
              >
                <IconBrandX className="h-5 w-5" />
              </a>
              <a
                href="https://anuragbhonsle.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-white hover:border-white hover:text-white hover:scale-105 transition-all duration-300"
                aria-label="Personal Portfolio"
              >
                <IconWorld className="h-5 w-5" />
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
