import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, existsSync } from 'fs';
import { createProxyMiddleware } from 'http-proxy-middleware';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;

const distPath = join(__dirname, 'dist');
const indexHtmlPath = join(distPath, 'index.html');

// Get backend API URL from environment variable (base URL only, without /onp/v1)
const BACKEND_API_URL = process.env.BACKEND_API_URL || 'https://onppoc-qa.as-g8.cf.comcast.net';

// Parse JSON bodies for proxy requests
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Proxy API requests to backend to avoid CORS issues
app.use('/api', createProxyMiddleware({
  target: BACKEND_API_URL,
  changeOrigin: true,
  pathRewrite: {
    '^/api': '/onp/v1', // Map /api to /onp/v1 when forwarding to backend
  },
  onProxyReq: (proxyReq, req, res) => {
    // Forward all headers from the original request
    Object.keys(req.headers).forEach((key) => {
      if (req.headers[key]) {
        proxyReq.setHeader(key, req.headers[key]);
      }
    });
  },
  onError: (err, req, res) => {
    console.error('Proxy error:', err);
    res.status(500).json({ error: 'Proxy error', message: err.message });
  },
}));

// Serve static files from dist directory
if (existsSync(distPath)) {
  app.use(express.static(distPath));
} else {
  console.error('ERROR: dist directory does not exist. Please run npm run build first.');
}

// Handle SPA routing - serve index.html for all routes
app.get('*', (req, res) => {
  // Skip health check and API endpoints
  if (req.path === '/health' || req.path.startsWith('/api')) {
    return;
  }
  
  if (!existsSync(indexHtmlPath)) {
    console.error(`ERROR: ${indexHtmlPath} does not exist`);
    return res.status(500).send('Application not built. Please ensure dist/index.html exists.');
  }
  
  try {
    const indexHtml = readFileSync(indexHtmlPath, 'utf-8');
    res.send(indexHtml);
  } catch (error) {
    console.error('Error reading index.html:', error);
    res.status(500).send('Error loading application');
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Dist path: ${distPath}`);
  console.log(`Index.html exists: ${existsSync(indexHtmlPath)}`);
});

