import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  root: 'frontend',
  plugins: [react()],
  server: {
    host: process.env.SPARTIN_DEV_ORIGINS?.trim() ? '0.0.0.0' : '127.0.0.1',
    port: Number(process.env.SPARTIN_WEB_PORT ?? 5173),
    strictPort: true,
    proxy: {
      '/api': { target: `http://127.0.0.1:${process.env.PORT ?? 3000}`, changeOrigin: false },
    },
  },
  build: { outDir: '../dist/client', emptyOutDir: true },
})
