import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'
import { VitePWA, VitePWAOptions } from 'vite-plugin-pwa'

const isDev = process.env.NODE_ENV === 'development'

const pwaOptions: Partial<VitePWAOptions> = {
  mode: isDev ? 'development' : 'production',
  base: '/',
  injectRegister: 'script',
  devOptions: {
    enabled: isDev, // only enable in dev mode
  },
  workbox: {
    globDirectory: 'dist', // ✅ fixes warning
    cleanupOutdatedCaches: true,
    globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg,json}'],
    globIgnores: ['**/node_modules/**/*', 'sw.js', 'workbox-*.js'],
    runtimeCaching: [
      {
        urlPattern: ({ request }) => request.destination === 'document',
        handler: 'NetworkFirst',
        options: { cacheName: 'html-cache' },
      },
      {
        urlPattern: ({ request }) => request.destination === 'style',
        handler: 'StaleWhileRevalidate',
        options: { cacheName: 'css-cache' },
      },
      {
        urlPattern: ({ request }) => request.destination === 'script',
        handler: 'CacheFirst',
        options: { cacheName: 'js-cache' },
      },
      {
        urlPattern: ({ request }) => request.destination === 'image',
        handler: 'CacheFirst',
        options: { cacheName: 'image-cache' },
      },
      {
        urlPattern: ({ request }) => request.destination === 'font',
        handler: 'CacheFirst',
        options: { cacheName: 'font-cache' },
      },
      {
        urlPattern: ({ url }) => url.pathname.includes('/api/'),
        handler: 'NetworkFirst',
        options: { cacheName: 'api-cache', networkTimeoutSeconds: 10 },
      },
    ],
  },
  manifest: {
    scope: '/',
    name: 'Rafikey',
    short_name: 'Rafikey',
    start_url: '/',
    display: 'standalone',
    description: 'SRHR consultancy services app',
    theme_color: '#252525',
    background_color: '#252525',
    icons: [
      { src: 'pwa/icons/maskable_icon_x512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: 'pwa/icons/maskable_icon_x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      // ...keep your other icons
    ],
  },
}

export default defineConfig({
  plugins: [vue(), vueJsx(), vueDevTools(), VitePWA(pwaOptions)],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
