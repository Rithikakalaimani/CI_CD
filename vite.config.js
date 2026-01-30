import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Blue-green: set VITE_BASE_PATH to /REPO/blue/ or /REPO/green/ in CI
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE_PATH || './',
})
