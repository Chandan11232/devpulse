import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "https://devpulse-backend-91x8.onrender.com", // <-- Replace with your live Render backend URL
        changeOrigin: true,
      },
    },
  },
});
