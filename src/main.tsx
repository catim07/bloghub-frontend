import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { GoogleOAuthProvider } from '@react-oauth/google'; // ← THÊM DÒNG NÀY

createRoot(document.getElementById("root")!).render(
  <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}> {/* ← THÊM WRAPPER NÀY */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </GoogleOAuthProvider>
);