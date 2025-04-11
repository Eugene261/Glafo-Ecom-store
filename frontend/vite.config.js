import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'force-env-variables',
      config(config, { command }) {
        return {
          define: {
            'import.meta.env.VITE_BACKEND_URL': JSON.stringify('http://localhost:9000'),
          }
        }
      }
    }
  ],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    sourcemap: false
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})
