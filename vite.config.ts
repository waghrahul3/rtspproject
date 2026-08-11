import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    // Bind to all interfaces and honor the port Freebuff injects for the
    // isolated workspace preview. HMR stays disabled (Freebuff requirement).
    // The app talks to Supabase (cloud or local) directly — no proxy needed.
    host: "0.0.0.0",
    port: Number(process.env.PORT) || 5173,
    hmr: false,
  },
});
