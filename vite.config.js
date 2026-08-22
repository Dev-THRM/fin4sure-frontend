import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': {
        // target: 'https://palevioletred-ape-449755.hostingersite.com',
        target: 'https://localhost:5173',
        changeOrigin: true,
        secure: false,
      }
    }
  }
});
