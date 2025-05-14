import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path'; // ✅ Add this line

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
      '/steam': {
        target: 'https://steamcommunity.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/steam/, ''),
      },
    },
  },
});
