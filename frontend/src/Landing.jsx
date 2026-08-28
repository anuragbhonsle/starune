import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import FlipWords from "./components/FlipWords";
import { BsStar } from "react-icons/bs";

export default function Landing() {
  const navigate = useNavigate();

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
    <div className="min-h-screen bg-black flex flex-col items-center justify-center relative overflow-hidden">
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
              boxShadow: star.glow ? `0 0 10px ${star.color}` : "none",
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="z-10 flex flex-col items-center justify-center text-center px-6 py-4">
        <h1 className="font-bold text-white leading-tight text-4xl sm:text-3xl lg:text-5xl tracking-wider mb-4">
          <span>
            Star{" "}
            <FlipWords
              words={["Gazing", "Watching", "Tracking", "Exploring"]}
              duration={5000}
              className="text-white"
            />
            Tonight
          </span>
        </h1>
        <button
          onClick={() => navigate("/app")}
          className="glass-button px-8 py-3 text-lg rounded-full hover:bg-white/70 active:scale-95 duration-200 transition-all"
        >
          Check
        </button>
      </div>
    </div>
  );
}
