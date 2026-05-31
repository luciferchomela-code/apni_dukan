import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import App from "./App.jsx"
import "./index.css"
import { GoogleOAuthProvider } from "@react-oauth/google"
import { AppProvider } from "./context/AppContext.jsx"
import "leaflet/dist/leaflet.css";
import { SocketProvider } from "./context/SocketContext.jsx"
export const authService = import.meta.env.VITE_AUTH_SERVICE || "http://localhost:5000"
export const shopService = import.meta.env.VITE_SHOP_SERVICE || "http://localhost:5001"
export const realtimeService = import.meta.env.VITE_REALTIME_SERVICE || "http://localhost:5004"
export const riderService = import.meta.env.VITE_RIDER_SERVICE || "http://localhost:5005"
export const utilsService = import.meta.env.VITE_UTILS_SERVICE || "http://localhost:5002"
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <GoogleOAuthProvider clientId="21441959275-0bojkheugd6qvsikdmm2r45gtvvpld46.apps.googleusercontent.com">
      <AppProvider>
        <SocketProvider>
          <App />
        </SocketProvider>
      </AppProvider>
    </GoogleOAuthProvider>
  </StrictMode>
)