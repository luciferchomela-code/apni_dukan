import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import App from "./App"
import "./index.css"
import { GoogleOAuthProvider } from "@react-oauth/google"
import { AppProvider } from "./context/AppContext"

export const authService = "http://localhost:5000"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId="21441959275-0bojkheugd6qvsikdmm2r45gtvvpld46.apps.googleusercontent.com">
      <AppProvider>
        <App />
      </AppProvider>
    </GoogleOAuthProvider>
  </StrictMode>
)