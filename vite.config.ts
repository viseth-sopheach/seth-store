import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: "./", // Ensure static file hosting works everywhere
  server: {
    proxy: {
      "/api": {
        target: "https://seth-store-api.onrender.com",
        changeOrigin: true,
        secure: true,
      },
    },
  },
})
