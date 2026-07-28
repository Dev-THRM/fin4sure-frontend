import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./assets/styles/globals.css";

// Force build hash update v2-rel-1.0.2
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
