import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Toaster } from "react-hot-toast";
import UserProvider from "./context/UserProvider.jsx";
import ThemeProvider from "./context/ThemeProvider.jsx";

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeProvider>
      <GoogleOAuthProvider clientId={clientId}>
       <UserProvider>
          <App />
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 3500,
              style: {
                background: "var(--surface-hover)",
                border: "1px solid var(--border)",
                color: "var(--text)",
                borderRadius: 8,
                fontSize: 13,
                boxShadow: "0 8px 24px var(--shadow-color)",
              },
              success: {
                style: {
                  background: "var(--surface-hover)",
                  border: "1px solid rgba(52,211,153,0.35)",
                  color: "var(--text)",
                },
                iconTheme: { primary: "#34D399", secondary: "var(--surface-hover)" },
              },
              error: {
                style: {
                  background: "var(--surface-hover)",
                  border: "1px solid rgba(239,68,68,0.35)",
                  color: "var(--text)",
                },
                iconTheme: { primary: "#EF4444", secondary: "var(--surface-hover)" },
              },
            }}
          />
        </UserProvider>
      </GoogleOAuthProvider>
    </ThemeProvider>
  </StrictMode>
);
