import { readFileSync } from 'node:fs';
import { fileURLToPath, URL } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

// As cores do manifesto vêm da fonte única dos tokens da marca (brand/colors/tokens.json).
const tokens = JSON.parse(
  readFileSync(fileURLToPath(new URL('../../brand/colors/tokens.json', import.meta.url)), 'utf8'),
) as { themes: { light: { background: string; foreground: string } } };

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'favicon.ico', 'apple-touch-icon.png'],
      manifest: {
        name: 'Atena IA',
        short_name: 'Atena',
        description: 'Gestão, engenharia e controle de obras em um só lugar.',
        lang: 'pt-BR',
        start_url: '/',
        display: 'standalone',
        background_color: tokens.themes.light.background,
        theme_color: tokens.themes.light.foreground,
        icons: [
          { src: '/pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/pwa-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: '/pwa-maskable-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable',
          },
          {
            src: '/pwa-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        navigateFallbackDenylist: [/^\/api\//],
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        globIgnores: ['**/maplibre-gl*.js', 'demo/**'],
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
      },
    }),
  ],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  optimizeDeps: { exclude: ['maplibre-gl'] },
  server: {
    port: 5173,
    strictPort: true,
    proxy: { '/api': { target: 'http://127.0.0.1:8787', changeOrigin: true } },
  },
});
