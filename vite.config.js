import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        entryFileNames: `assets/[name]-v2-${Date.now()}.js`,
        chunkFileNames: `assets/[name]-v2-${Date.now()}.js`,
        assetFileNames: `assets/[name]-v2-${Date.now()}[extname]`
      }
    }
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://palevioletred-ape-449755.hostingersite.com',
        changeOrigin: true,
        secure: false,
      }
    }
  }
});
