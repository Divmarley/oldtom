import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '')
  const devApiOrigin = env.VITE_DEV_API_ORIGIN || 'http://localhost:8000'

  return {
    plugins: [react()],
    server: {
      host: '0.0.0.0',
      port: 5173,
      proxy: {
        '/api': {
          target: devApiOrigin,
          changeOrigin: true,
        },
        '/media': {
          target: devApiOrigin,
          changeOrigin: true,
        },
      },
      watch: {
        usePolling: true,
      },
    },
  }
})
