import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: { include: ['backend/test/**/*.test.ts', 'frontend/test/**/*.test.tsx'], maxWorkers: 2 },
})
