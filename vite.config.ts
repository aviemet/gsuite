import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
      '@/shared': path.resolve(__dirname, './packages/shared/src'),
      '@/frontend': path.resolve(__dirname, './packages/frontend/src'),
      '@/functions': path.resolve(__dirname, './packages/functions/src'),
    },
  },
})
