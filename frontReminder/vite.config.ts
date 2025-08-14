import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        // Configuración básica de code splitting
        manualChunks: {
          'vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui': ['lucide-react', 'react-toastify', '@react-oauth/google']
        }
      }
    },
    // Optimizar tamaño de chunks
    chunkSizeWarningLimit: 1000
  },
  // Configuración de desarrollo
  server: {
    port: 3000,
    open: true
  },
  // Optimización de dependencias
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'lucide-react'
    ]
  }
})
