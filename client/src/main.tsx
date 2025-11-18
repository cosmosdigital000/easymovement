import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import "bootstrap/dist/css/bootstrap.min.css";
import "./jquery-fix.js"; // Fix jQuery plugin errors
// Only load jQuery plugins for non-React components to avoid conflicts
// import "./js/main";
import { BrowserRouter } from "react-router";
import { Toaster } from "sonner";
import { initializePluginsForPage } from "./lib/conditionalPluginLoader";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key");
}

// Initialize jQuery plugins only for appropriate pages
document.addEventListener('DOMContentLoaded', () => {
  initializePluginsForPage();
});

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <App />
    <Toaster />
  </BrowserRouter>
);
