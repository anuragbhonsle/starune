import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist",
  },
  base: "/",
  server: {
    allowedHosts: [
      "34c338af3541.ngrok-free.app",
      "stargaze-backend.onrender.com",
    ],
  },
  define: {
    "process.env.VITE_API_URL": JSON.stringify(
      process.env.VITE_API_URL || "http://localhost:5000"
    ),
  },
});
