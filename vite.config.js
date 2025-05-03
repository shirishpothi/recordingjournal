import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-refresh';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    // Generate service worker in production mode
    rollupOptions: {
      output: {
        manualChunks: {}
      }
    }
  },
  server: {
    port: 5000,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      }
    }
  }
});
