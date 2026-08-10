import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ConvexReactClient } from "convex/react";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { Toaster } from "sonner";
import App from "./App";
import "./index.css";

const convex = new ConvexReactClient(
  import.meta.env.VITE_CONVEX_URL as string,
);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ConvexAuthProvider client={convex}>
      <BrowserRouter>
        <App />
        <Toaster theme="dark" position="bottom-right" richColors closeButton />
      </BrowserRouter>
    </ConvexAuthProvider>
  </StrictMode>,
);
