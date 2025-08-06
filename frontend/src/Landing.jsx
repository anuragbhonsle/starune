import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css'; // Make sure twinkle animation & glass-button are defined here
import { motion } from "framer-motion";
import { FaGithub } from 'react-icons/fa';

export default function Landing() {
    const navigate = useNavigate();

    const stars = useMemo(() => {
        const starArray = [];
        for (let i = 0; i < 150; i++) {
            starArray.push({
                id: i,
                left: -50 + Math.random() * 200,
                top: Math.random() * 100,
                delay: Math.random() * 6,
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
                            position: 'absolute',
                            left: `${star.left}%`,
                            top: `${star.top}%`,
                            width: '2px',
                            height: '2px',
                            backgroundColor: 'white',
                            borderRadius: '50%',
                            opacity: 0.8,
                            animation: `twinkle 2s infinite ${star.delay}s alternate`,
                        }}
                    />
                ))}
            </div>


            {/* Main content */}
            <div className="z-10 flex flex-col items-center justify-center text-center px-6 py-4">
                <h1 className="text-white font-bold leading-tight text-[55px] sm:text-[64px] md:text-[96px] lg:text-[112px] tracking-wider drop-shadow-[0_0_24px_rgba(255,255,255,0.8)] mb-2">
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



                <button
                    onClick={() => navigate('/app')}
                    className="glass-button px-8 py-3 text-lg"
                >
                    Check
                </button>

            </div>
        </div>
    );

}
