import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'
import { VitePWA, VitePWAOptions } from 'vite-plugin-pwa'

const isDev = process.env.VITE_APP_NODE_ENV === 'development'

const pwaOptions: Partial<VitePWAOptions> = {
  mode: isDev ? 'development' : 'production',
  base: '/',
 // registerType: 'autoUpdate',
  injectRegister: 'script',
  devOptions: {
    enabled: isDev, // ✅ only enable PWA emulation in dev
  },
  strategies: 'injectManifest',  // Telling the plugin to use your own service worker file
  srcDir: 'src',  //Directory containing service worker file
  filename: 'custom-sw.js',
  // injectManifest: {
  //   swSrc: 'src/custom-sw.js',   // 👈 your actual SW source file
  //   swDest: 'dist/custom-sw.js', // 👈 the name of the generated SW file in dist folder
  //   // injectionPoint: 'self.__WB__MANIFEST'
  // },
  workbox: isDev
    ? undefined // ✅ disables precache scanning & removes warning
    : {
        globDirectory: 'dist',
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
      // {
      //   src: 'pwa/icons/maskable_icon_x512.png',
      //   sizes: '512x512',
      //   type: 'image/png',
      //   purpose: 'any'
      // },
      // {
      //   src: 'pwa/icons/maskable_icon_x512.png',
      //   sizes: '512x512',
      //   type: 'image/png',
      //   purpose: 'maskable'
      // },
      {
        src: 'pwa/icons/maskable_icon_x384.png',
        sizes: '384x384',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: 'pwa/icons/maskable_icon_x384.png',
        sizes: '384x384',
        type: 'image/png',
        purpose: 'maskable'
      },
      {
        src: 'pwa/icons/maskable_icon_x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: 'pwa/icons/maskable_icon_x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable'
      },
      {
        src: 'pwa/icons/maskable_icon_x128.png',
        sizes: '128x128',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: 'pwa/icons/maskable_icon_x128.png',
        sizes: '128x128',
        type: 'image/png',
        purpose: 'maskable'
      },
      {
        src: 'pwa/icons/maskable_icon_x96.png',
        sizes: '96x96',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: 'pwa/icons/maskable_icon_x96.png',
        sizes: '96x96',
        type: 'image/png',
        purpose: 'maskable'
      },
      {
        src: 'pwa/icons/maskable_icon_x72.png',
        sizes: '72x72',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: 'pwa/icons/maskable_icon_x72.png',
        sizes: '72x72',
        type: 'image/png',
        purpose: 'maskable'
      },
      {
        src: 'pwa/icons/maskable_icon_x48.png',
        sizes: '48x48',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: 'pwa/icons/maskable_icon_x48.png',
        sizes: '48x48',
        type: 'image/png',
        purpose: 'maskable'
      },

    ],
    screenshots: [
      {
        src: 'pwa/screenshots/localhost_4433_(iPhone 14 Pro Max).png',
        sizes: '1290x2796',
        type: 'image/png'
      },
      {
        src: 'pwa/screenshots/localhost_4433_(Nest Hub).png',
        sizes: '2048x1724',
        type: 'image/png'
      },
      {
        src: 'pwa/screenshots/localhost_4433_(Nest Hub Max).png',
        sizes: '2560x1708',
        type: 'image/png'
      },
      {
        src: 'pwa/screenshots/localhost_4433_(Samsung Galaxy A51_71).png',
        sizes: '1082x2400',
        type: 'image/png'
      },
      {
        src: 'pwa/screenshots/localhost_4433_(Samsung Galaxy S20 Ultra).png',
        sizes: '1442x3202',
        type: 'image/png'
      },
      {
        src: 'pwa/screenshots/localhost_4433_(Surface Pro 7).png',
        sizes: '1824x2736',
        type: 'image/png'
      }
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
