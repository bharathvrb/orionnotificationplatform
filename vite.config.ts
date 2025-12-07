import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: process.env.VITE_API_BASE_URL || 'http://onppoc-qa.as-g8.cf.comcast.net/onp/v1',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            // Forward all headers
            if (req.headers) {
              Object.keys(req.headers).forEach((key) => {
                if (req.headers[key]) {
                  proxyReq.setHeader(key, req.headers[key] as string);
                }
              });
            }
          });
        },
      },
    },
  },
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
  build: {
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
})
