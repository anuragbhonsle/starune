import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";

import App from "./App.jsx";
import About from "./components/About.jsx";
import Landing from "./Landing.jsx";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/app" element={<App />} />
      <Route path="/about" element={<About />} />
    </Routes>
  </BrowserRouter>,
);
