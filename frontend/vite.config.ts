import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

// PWA: el Service Worker guarda la aplicación completa (HTML, JS, CSS, íconos)
// para que abra sin internet. Los datos de la API se guardan aparte en IndexedDB
// (ver src/lib/api.ts) y lo que se crea sin señal va a la cola de src/lib/cola.ts.
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icono.svg"],
      manifest: {
        name: "SABIA · Saberes vivos",
        short_name: "SABIA",
        description: "Saberes, Ancestralidad, Bioculturalidad e Inteligencia Articulada. Funciona sin internet.",
        lang: "es-CO",
        start_url: "/",
        display: "standalone",
        background_color: "#EFECE6",
        theme_color: "#2F5939",
        icons: [
          { src: "icono.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
          { src: "icono-maskable.svg", sizes: "any", type: "image/svg+xml", purpose: "maskable" }
        ]
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,ico,webmanifest}"],
        navigateFallback: "/index.html",
        navigateFallbackDenylist: [/^\/api\//],
        cleanupOutdatedCaches: true
      },
      devOptions: { enabled: false }
    })
  ],
  server: {
    port: 5173,
    // datos/semilla.json (respaldo offline) vive en la raíz del monorepo
    fs: { allow: [".."] },
    proxy: {
      "/api": { target: process.env.VITE_PROXY_API ?? "http://localhost:8000", changeOrigin: true }
    }
  }
});
