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
// For DEV environment, you may need to set this to the DEV backend URL
// Possible values:
// - DEV: https://onppoc-dev.as-g8.cf.comcast.net (or similar)
// - QA: https://onppoc-qa.as-g8.cf.comcast.net
const BACKEND_API_URL = process.env.BACKEND_API_URL || 'https://onppoc-qa.as-g8.cf.comcast.net';

console.log(`[Server] Backend API URL: ${BACKEND_API_URL}`);
console.log(`[Server] Proxy will map /api/* to ${BACKEND_API_URL}/onp/v1/*`);
console.log(`[Server] Example: /api/mongoDBDetails -> ${BACKEND_API_URL}/onp/v1/mongoDBDetails`);

// Health check endpoint (before JSON parsing to avoid body parsing issues)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Parse JSON bodies - needed for proxy to handle POST requests
app.use(express.json());

// Proxy API requests to backend to avoid CORS issues
// MUST be before static file serving to ensure it catches /api routes
const proxyMiddleware = createProxyMiddleware({
  target: BACKEND_API_URL,
  changeOrigin: true,
  pathRewrite: {
    '^/api': '/onp/v1', // Map /api to /onp/v1 when forwarding to backend
  },
  onProxyReq: (proxyReq, req, res) => {
    const targetPath = req.path.replace('/api', '/onp/v1');
    console.log(`[Proxy] Forwarding ${req.method} ${req.path} to ${BACKEND_API_URL}${targetPath}`);
    console.log(`[Proxy] Headers:`, Object.keys(req.headers).filter(h => !['host'].includes(h.toLowerCase())));
    
    // Forward all headers from the original request
    // The proxy middleware will handle the body automatically
    Object.keys(req.headers).forEach((key) => {
      // Skip host header as it should be set by the proxy
      if (key.toLowerCase() === 'host') {
        return;
      }
      if (req.headers[key]) {
        proxyReq.setHeader(key, req.headers[key]);
      }
    });
  },
  onProxyRes: (proxyRes, req, res) => {
    console.log(`[Proxy] Response: ${proxyRes.statusCode} ${proxyRes.statusMessage} for ${req.method} ${req.path}`);
  },
  onError: (err, req, res) => {
    console.error(`[Proxy] Error for ${req.method} ${req.path}:`, err.message);
    if (!res.headersSent) {
      res.status(500).json({ 
        error: 'Proxy error', 
        message: err.message,
        details: `Failed to proxy ${req.method} ${req.path} to ${BACKEND_API_URL}/onp/v1${req.path.replace('/api', '')}`
      });
    }
  },
  logLevel: 'debug',
});

// Apply proxy middleware to all /api routes (handles all HTTP methods: GET, POST, PUT, DELETE, etc.)
// The middleware will match all routes starting with /api
app.use('/api', (req, res, next) => {
  console.log(`[Server] Received ${req.method} request to ${req.path} (will proxy to ${BACKEND_API_URL}/onp/v1${req.path.replace('/api', '')})`);
  next();
}, proxyMiddleware);

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

