import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import App from "./App.jsx"
import "./index.css"
import { GoogleOAuthProvider } from "@react-oauth/google"
import { AppProvider } from "./context/AppContext.jsx"
import "leaflet/dist/leaflet.css";
import { socketProvider } from "./context/SocketContext.jsx"
export const authService = "http://localhost:5000"
export const shopService = "http://localhost:5001"
export const realtimeService = "http://localhost:5004"

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <GoogleOAuthProvider clientId="21441959275-0bojkheugd6qvsikdmm2r45gtvvpld46.apps.googleusercontent.com">
      <AppProvider>
        <socketProvider>
        <App />
        </socketProvider>
      </AppProvider>
    </GoogleOAuthProvider>
  </StrictMode>
)