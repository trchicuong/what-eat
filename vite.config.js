import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  build: {
    // Optimize chunks for better caching and loading
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-confetti': ['canvas-confetti'],
        },
      },
    },
    // Smaller chunk size for mobile
    chunkSizeWarningLimit: 600,
    // Enable minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
        drop_debugger: true,
      },
    },
  },
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.js',
      devOptions: {
        enabled: true,
        type: 'module',
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        globIgnores: ['**/node_modules/**', '**/*.map'],
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024, // 3MB max per file
        cleanupOutdatedCaches: true,
        skipWaiting: true,
        clientsClaim: true,
        // Note: runtimeCaching config is ignored when using injectManifest strategy
        // All runtime caching is configured in src/sw.js
      },
      manifest: {
        name: 'Hôm Nay Ăn Gì?',
        short_name: 'Ăn Gì?',
        description: 'Ứng dụng gợi ý món ăn hàng ngày',
        theme_color: '#58CC02',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: 'images/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'images/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'images/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
    }),
  ],
});
