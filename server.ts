import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';

dotenv.config();

async function startServer() {
  const app = express();
  app.use(express.json());

  // Backend proxy route to fetch Google Sheet CSV without CORS restrictions
  app.get('/api/fetch-sheet', async (req, res) => {
    try {
      const sheetUrl = req.query.url as string;
      if (!sheetUrl) {
        return res.status(400).json({ error: 'Missing sheet URL' });
      }
      const response = await fetch(sheetUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch sheet: ${response.statusText}`);
      }
      const csvText = await response.text();
      res.send(csvText);
    } catch (err: any) {
      console.error('Fetch sheet error:', err);
      res.status(500).json({ error: err.message || 'Failed to fetch sheet data due to network error' });
    }
  });

  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa'
  });

  app.use(vite.middlewares);

  const port = 3000;
  app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${port}`);
  });
}

startServer();
