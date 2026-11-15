import { fileURLToPath, URL } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

// Cores do manifesto (tema claro), iguais a --background e --foreground em src/design/tokens.css.
// A pasta brand/ não faz parte deste repositório, então os valores ficam inline.
const tokens = { themes: { light: { background: '#f4f7fa', foreground: '#04233f' } } };

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
  // Permite abrir a versão compilada por túnel temporário (opção B de publicação).
  preview: { port: 4173, strictPort: true, allowedHosts: ['.trycloudflare.com'] },
  server: {
    port: 5173,
    strictPort: true,
    proxy: { '/api': { target: 'http://127.0.0.1:8787', changeOrigin: true } },
  },
});
