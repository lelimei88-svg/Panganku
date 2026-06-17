import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { db } from './src/db/index.ts';
import { orders as ordersTable } from './src/db/schema.ts';
import { getOrCreateUser } from './src/db/users.ts';
import { requireAuth, optionalAuth, AuthRequest } from './src/middleware/auth.ts';
import { eq, desc } from 'drizzle-orm';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Body parser
  app.use(express.json());

  // API Route: Register / Synchronize user profiles
  app.post('/api/auth/sync', requireAuth as any, async (req: AuthRequest, res) => {
    try {
      if (!req.user || !req.user.uid || !req.user.email) {
        return res.status(400).json({ error: 'Invalid user token credentials' });
      }
      const dbUser = await getOrCreateUser(req.user.uid, req.user.email);
      res.json({ success: true, user: dbUser });
    } catch (error: any) {
      console.error('Error in auth sync endpoint:', error);
      res.status(500).json({ error: error.message || 'Auth sync failed' });
    }
  });

  // API Route: Fetch Orders
  app.get('/api/orders', optionalAuth as any, async (req: AuthRequest, res) => {
    try {
      // Fetch all orders from PostgreSQL Cloud SQL database
      const dbOrders = await db.select().from(ordersTable).orderBy(desc(ordersTable.createdAt));
      
      const mappedOrders = dbOrders.map(o => ({
        id: o.id,
        clientName: o.clientName,
        phoneNumber: o.phoneNumber,
        address: o.address,
        items: JSON.parse(o.itemsJson),
        subtotal: o.subtotal,
        discount: o.discount,
        shipping: o.shipping,
        total: o.total,
        paymentMethod: o.paymentMethod,
        status: o.status,
        csrfToken: o.csrfToken,
        timestamp: o.createdAt ? o.createdAt.toISOString() : new Date().toISOString()
      }));

      res.json(mappedOrders);
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      res.status(500).json({ error: 'Database query failed' });
    }
  });

  // API Route: Create Order
  app.post('/api/orders', optionalAuth as any, async (req: AuthRequest, res) => {
    try {
      const { 
        id, 
        clientName, 
        phoneNumber, 
        address, 
        items, 
        subtotal, 
        discount, 
        shipping, 
        total, 
        paymentMethod, 
        csrfToken 
      } = req.body;

      const userUid = req.user ? req.user.uid : null;

      await db.insert(ordersTable).values({
        id,
        userUid,
        clientName,
        phoneNumber,
        address,
        itemsJson: JSON.stringify(items),
        subtotal,
        discount,
        shipping,
        total,
        paymentMethod,
        csrfToken,
        status: 'PENDING'
      });

      res.status(201).json({ success: true, id });
    } catch (errorByQuery: any) {
      console.error('Error creating order in DB:', errorByQuery);
      res.status(500).json({ error: 'Failed to record transaction' });
    }
  });

  // API Route: Approve Order
  app.post('/api/orders/:id/approve', optionalAuth as any, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      
      await db.update(ordersTable)
        .set({ status: 'APPROVED' })
        .where(eq(ordersTable.id, id));

      res.json({ success: true });
    } catch (error: any) {
      console.error('Error approving order:', error);
      res.status(500).json({ error: 'Failed to update order status' });
    }
  });

  // Vite middleware setup for Development/Production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: any, res: any) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`PanganKu Backend Server running on port ${PORT}`);
  });
}

startServer();
