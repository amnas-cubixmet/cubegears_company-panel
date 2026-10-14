import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ command, mode }) => {
  const vars = loadEnv(mode, process.cwd(), 'VITE_');
  if (command === 'build' && !vars.VITE_API_URL && !vars.VITE_API_BASE_URL) {
    throw new Error('Production build requires VITE_API_URL pointing to the Django /api/v1 backend.');
  }
  return {
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
  };
});
