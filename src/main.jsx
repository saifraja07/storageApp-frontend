import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { GoogleOAuthProvider } from "@react-oauth/google";
import AppToaster from "./components/AppToaster.jsx";
import UserProvider from "./context/UserProvider.jsx";
import ThemeProvider from "./context/ThemeProvider.jsx";

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeProvider>
      <GoogleOAuthProvider clientId={clientId}>
       <UserProvider>
          <App />
          <AppToaster />
        </UserProvider>
      </GoogleOAuthProvider>
    </ThemeProvider>
  </StrictMode>
);
