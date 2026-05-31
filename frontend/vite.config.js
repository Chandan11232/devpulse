import { defineConfig } from "vite";
import react from "@vitejs/react-vite";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "https://devpulse-backend.onrender.com", // <-- Replace with your live Render backend URL
        changeOrigin: true,
      },
    },
  },
});
