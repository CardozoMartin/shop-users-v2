import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Permite acceder al dev server por dominios simulados (prueba de dominios propios).
    allowedHosts: ['mitienda.test'],
  },
})
