import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// SABIA (ALUNA IA · SABIA & CEIBA)
// - En desarrollo, /api se reenvía al backend FastAPI (VITE_PROXY_API, por defecto :8000).
// - PWA: el Service Worker guarda la app (HTML, JS, CSS, logos) para abrir sin internet.
//   Los datos se guardan aparte (localStorage / IndexedDB) y lo creado sin señal va a una cola.
// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['logo-ceiba.svg', 'icons/*.png'],
      manifest: {
        name: 'SABIA · Diálogo de Saberes UNIMAGDALENA',
        short_name: 'SABIA',
        description: 'Plataforma de diálogo de saberes de la Universidad del Magdalena: saberes bajo custodia comunitaria, Ceiba IA y salud intercultural. Funciona sin internet.',
        lang: 'es-CO',
        start_url: '/',
        display: 'standalone',
        background_color: '#F8FAFC',
        theme_color: '#1D6A4E',
        icons: [
          { src: 'icons/icono-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'icons/icono-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'icons/icono-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          { src: 'icono-app.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' }
        ]
      },
      workbox: {
        // La app y sus íconos se precargan; las fotografías grandes se guardan al verlas por primera vez.
        globPatterns: ['**/*.{js,css,html,svg,ico,webmanifest}', 'assets/logos/*.png', 'assets/avatars/*.jpg'],
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api\//],
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/assets/photos/'),
            handler: 'CacheFirst',
            options: { cacheName: 'aluna-fotos', expiration: { maxEntries: 40, maxAgeSeconds: 60 * 60 * 24 * 60 } }
          }
        ]
      }
    })
  ],
  server: {
    port: 5173,
    // El módulo de Salud usa como respaldo offline database/seeds/salud_sabia.json
    fs: { allow: ['..'] },
    proxy: {
      '/api': { target: process.env.VITE_PROXY_API ?? 'http://localhost:8000', changeOrigin: true }
    }
  }
})
