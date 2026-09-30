import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  createOrder,
  getAllOrders,
  getOrderByNumber,
  updateOrderStatus,
  createCustomRequest,
  getAllCustomRequests,
  updateCustomRequestStatus,
  getAllCustomers,
  getStats,
} from './src/server/db.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  const isProd = process.env.NODE_ENV === 'production';

  app.use(express.json());

  // API Routes
  app.post('/api/orders', (req, res) => {
    try {
      const {
        customer_name,
        customer_phone,
        customer_email,
        city,
        address,
        payment_method,
        notes,
        items,
        subtotal,
        delivery_fee,
        total_amount,
      } = req.body;

      if (!customer_name || !customer_phone || !address || !items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'Missing required order details or empty cart' });
      }

      const order = createOrder({
        customer_name,
        customer_phone,
        customer_email,
        city: city || 'Bahawalpur',
        address,
        payment_method: payment_method || 'cod',
        notes,
        items,
        subtotal: Number(subtotal) || 0,
        delivery_fee: Number(delivery_fee) || 0,
        total_amount: Number(total_amount) || 0,
      });

      return res.status(201).json({ success: true, order });
    } catch (err: any) {
      console.error('Error creating order:', err);
      return res.status(500).json({ error: err.message || 'Internal server error' });
    }
  });

  app.get('/api/orders', (_req, res) => {
    try {
      const orders = getAllOrders();
      return res.json({ orders });
    } catch (err: any) {
      console.error('Error fetching orders:', err);
      return res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/orders/:orderNumber', (req, res) => {
    try {
      const order = getOrderByNumber(req.params.orderNumber);
      if (!order) return res.status(404).json({ error: 'Order not found' });
      return res.json({ order });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.patch('/api/orders/:id/status', (req, res) => {
    try {
      const { status } = req.body;
      if (!status) return res.status(400).json({ error: 'Status is required' });
      updateOrderStatus(req.params.id, status);
      return res.json({ success: true });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/custom-requests', (req, res) => {
    try {
      const { customer_name, phone, email, length, sleeves, size, colour, notes } = req.body;
      if (!customer_name || !phone || !length || !sleeves || !size || !colour) {
        return res.status(400).json({ error: 'Please provide all required fields' });
      }

      const request = createCustomRequest({
        customer_name,
        phone,
        email,
        length,
        sleeves,
        size,
        colour,
        notes,
      });

      return res.status(201).json({ success: true, request });
    } catch (err: any) {
      console.error('Error creating custom request:', err);
      return res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/custom-requests', (_req, res) => {
    try {
      const requests = getAllCustomRequests();
      return res.json({ requests });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.patch('/api/custom-requests/:id/status', (req, res) => {
    try {
      const { status } = req.body;
      if (!status) return res.status(400).json({ error: 'Status is required' });
      updateCustomRequestStatus(req.params.id, status);
      return res.json({ success: true });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/customers', (_req, res) => {
    try {
      const customers = getAllCustomers();
      return res.json({ customers });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/stats', (_req, res) => {
    try {
      const stats = getStats();
      return res.json({ stats });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // Vite Integration
  if (!isProd) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ELORIA server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
