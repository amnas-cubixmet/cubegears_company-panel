import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    sourcemap: false,
    minify: 'esbuild',
    target: 'es2020',
    cssCodeSplit: true,
    chunkSizeWarningLimit: 850,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          vendor: ['axios', 'lucide-react']
        }
      }
    }
  },
  preview: {
    port: 4173,
    strictPort: true
  }
});
