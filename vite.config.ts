import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  css: {
    modules: {
      scopeBehaviour: 'local',
    },
  },
  server: {
    proxy: {
      // ✅ Proxy Steam API directly
      '/steam': {
        target: 'https://steamcommunity.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/steam/, ''),
      },

      // ✅ Proxy your own Express server for csnews, steam-price, etc.
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
});
