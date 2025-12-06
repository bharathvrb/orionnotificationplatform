import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  preview: {
    port: process.env.PORT ? parseInt(process.env.PORT) : 8080,
    host: '0.0.0.0',
    strictPort: false,
    allowedHosts: [
      'onp-onboard-ui.as-g8.cf.comcast.net',
      '.cf.comcast.net', // Allow all Comcast CloudFoundry subdomains
      'localhost',
      '.localhost',
    ],
  },
})
