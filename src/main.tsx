import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Set dark mode as default
document.documentElement.classList.add("light");

// Capture UTM parameters on every page load and persist to localStorage.
// These are used as Lead Source in Zoho CRM when a new user signs up.
// Add ?utm_source=linkedin (or instagram, google, email, etc.) to any external link.
const _utmParams = new URLSearchParams(window.location.search);
const _utmSource = _utmParams.get('utm_source');
if (_utmSource) {
  localStorage.setItem('utm_source', _utmSource);
  localStorage.setItem('utm_medium', _utmParams.get('utm_medium') || '');
  localStorage.setItem('utm_campaign', _utmParams.get('utm_campaign') || '');
}

createRoot(document.getElementById("root")!).render(<App />);
