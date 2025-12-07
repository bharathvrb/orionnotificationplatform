import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;

const distPath = join(__dirname, 'dist');
const indexHtmlPath = join(distPath, 'index.html');

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Serve static files from dist directory
if (existsSync(distPath)) {
  app.use(express.static(distPath));
} else {
  console.error('ERROR: dist directory does not exist. Please run npm run build first.');
}

// Handle SPA routing - serve index.html for all routes
app.get('*', (req, res) => {
  // Skip health check endpoint
  if (req.path === '/health') {
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

