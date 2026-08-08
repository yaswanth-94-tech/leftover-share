import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import {
  fetchAllListings,
  insertListing,
  updateListingStatus,
  deleteListingById,
  getStats,
} from './src/db.js';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // API Routes

  // Healthcheck
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', service: 'Leftover Share API' });
  });

  // GET /api/listings - fetch all listings with optional filtering
  app.get('/api/listings', async (req: Request, res: Response) => {
    try {
      const search = (req.query.search as string) || '';
      const status = (req.query.status as string) || 'all';
      const category = (req.query.category as string) || 'all';

      const listings = await fetchAllListings(search, status, category);
      res.json(listings);
    } catch (err: any) {
      console.error('Error fetching listings:', err);
      res.status(500).json({ error: 'Failed to fetch listings from database' });
    }
  });

  // GET /api/stats - fetch community statistics
  app.get('/api/stats', async (_req: Request, res: Response) => {
    try {
      const stats = await getStats();
      res.json(stats);
    } catch (err: any) {
      console.error('Error fetching stats:', err);
      res.status(500).json({ error: 'Failed to fetch community statistics' });
    }
  });

  // POST /api/listings - create a new food listing
  app.post('/api/listings', async (req: Request, res: Response) => {
    try {
      const {
        food_item,
        quantity,
        location,
        available_from,
        available_until,
        contact_info,
        note,
        category,
      } = req.body;

      // Basic input validation
      if (!food_item || typeof food_item !== 'string' || food_item.trim().length < 2) {
        return res.status(400).json({ error: 'Food item description is required (at least 2 characters).' });
      }
      if (!quantity || typeof quantity !== 'string' || quantity.trim().length < 1) {
        return res.status(400).json({ error: 'Quantity is required (e.g. "3 portions", "1 tray").' });
      }
      if (!location || typeof location !== 'string' || location.trim().length < 2) {
        return res.status(400).json({ error: 'Pickup location address is required.' });
      }
      if (!available_from || typeof available_from !== 'string') {
        return res.status(400).json({ error: 'Available start time is required.' });
      }
      if (!available_until || typeof available_until !== 'string') {
        return res.status(400).json({ error: 'Available end time is required.' });
      }
      if (!contact_info || typeof contact_info !== 'string' || contact_info.trim().length < 2) {
        return res.status(400).json({ error: 'Contact phone or name is required.' });
      }

      const newListing = await insertListing({
        food_item,
        category,
        quantity,
        location,
        available_from,
        available_until,
        contact_info,
        note,
      });

      return res.status(201).json(newListing);
    } catch (err: any) {
      console.error('Error creating listing:', err);
      return res.status(500).json({ error: 'Failed to create listing in database' });
    }
  });

  // PATCH /api/listings/:id/claim - mark listing as claimed or active
  app.patch('/api/listings/:id/claim', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const targetStatus = req.body.status === 'active' ? 'active' : 'claimed';

      const updated = await updateListingStatus(id, targetStatus);
      if (!updated) {
        return res.status(404).json({ error: 'Listing not found' });
      }

      return res.json(updated);
    } catch (err: any) {
      console.error('Error updating claim status:', err);
      return res.status(500).json({ error: 'Failed to update listing status' });
    }
  });

  // DELETE /api/listings/:id - delete a listing
  app.delete('/api/listings/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const success = await deleteListingById(id);

      if (!success) {
        return res.status(404).json({ error: 'Listing not found' });
      }

      return res.json({ success: true, message: 'Listing removed successfully' });
    } catch (err: any) {
      console.error('Error deleting listing:', err);
      return res.status(500).json({ error: 'Failed to delete listing' });
    }
  });

  // Serve Frontend / Vite Middleware
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Leftover Share] Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
