// ⚠️ MUST be first — loads .env before any module reads process.env
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import { createServer } from 'http';
import { Server } from 'socket.io';

import connectDB from './config/db';
import { connectRedis } from './config/redis';
import { errorHandler, notFound } from './middleware/error.middleware';
import { generalLimiter } from './middleware/rateLimit.middleware';

// Routes
import authRoutes from './modules/auth/auth.routes';
import productRoutes from './modules/products/product.routes';
import categoryRoutes from './modules/categories/category.routes';
import collectionRoutes from './modules/collections/collection.routes';
import cartRoutes from './modules/cart/cart.routes';
import orderRoutes from './modules/orders/order.routes';
import wishlistRoutes from './modules/wishlist/wishlist.routes';
import reviewRoutes from './modules/reviews/review.routes';
import couponRoutes from './modules/coupons/coupon.routes';
import userRoutes from './modules/users/user.routes';
import adminRoutes from './modules/admin/admin.routes';
import analyticsRoutes from './modules/analytics/analytics.routes';
import paymentRoutes from './modules/payments/payment.routes';
import uploadRoutes from './modules/upload/upload.routes';

const app = express();
const httpServer = createServer(app);

// Socket.io for real-time order updates
export const io = new Server(httpServer, {
  cors: { origin: process.env.CLIENT_URL, methods: ['GET', 'POST'] }
});

io.on('connection', (socket) => {
  socket.on('join_room', (orderId: string) => socket.join(orderId));
  socket.on('disconnect', () => {});
});

// ── Middleware ──────────────────────────────────────────────
app.use(helmet({ crossOriginEmbedderPolicy: false }));
app.use(cors({
  origin: [process.env.CLIENT_URL || 'http://localhost:3000'],
  credentials: true,
}));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use('/api', generalLimiter);

// ── Health check ────────────────────────────────────────────
app.get('/health', (_req, res) => {
  const { isRedisConnected, getRedisClient } = require('./config/redis');
  const redisOk = isRedisConnected();
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    redis: redisOk ? 'connected' : 'disconnected',
    uptime: process.uptime(),
  });
});

app.get('/health/redis', async (_req, res) => {
  const { isRedisConnected, getRedisClient } = require('./config/redis');
  if (!isRedisConnected()) {
    return res.status(503).json({ status: 'disconnected', message: 'Redis is not connected' });
  }
  try {
    const client = getRedisClient();
    const pong = await client.ping();
    const info = await client.info('server');
    const versionMatch = info.match(/redis_version:([\d.]+)/);
    res.json({
      status: 'connected',
      ping: pong,
      version: versionMatch?.[1] || 'unknown',
      host: process.env.REDIS_URL || 'redis://127.0.0.1:6379',
    });
  } catch (err: any) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// API Root info response
const apiRootHandler = (_req: express.Request, res: express.Response) => {
  const { isRedisConnected } = require('./config/redis');
  res.json({
    name: 'CHRONEX LUNARIX Luxury Horology API',
    status: 'online',
    version: '1.0.0',
    redis: isRedisConnected() ? 'connected' : 'disconnected',
    documentation: 'http://localhost:5000/api/v1/products',
    endpoints: [
      '/api/v1/auth',
      '/api/v1/products',
      '/api/v1/categories',
      '/api/v1/collections',
      '/api/v1/cart',
      '/api/v1/orders',
      '/api/v1/wishlist',
      '/api/v1/reviews',
      '/api/v1/coupons',
      '/api/v1/users',
      '/api/v1/admin',
      '/health',
    ],
  });
};

app.get('/', apiRootHandler);
app.get('/api', apiRootHandler);
app.get('/api/v1', apiRootHandler);

// Helper router to bind both /api and /api/v1
const registerRoutes = (prefix: string) => {
  app.use(`${prefix}/auth`,        authRoutes);
  app.use(`${prefix}/products`,    productRoutes);
  app.use(`${prefix}/categories`,  categoryRoutes);
  app.use(`${prefix}/collections`, collectionRoutes);
  app.use(`${prefix}/cart`,        cartRoutes);
  app.use(`${prefix}/orders`,      orderRoutes);
  app.use(`${prefix}/wishlist`,    wishlistRoutes);
  app.use(`${prefix}/reviews`,     reviewRoutes);
  app.use(`${prefix}/coupons`,     couponRoutes);
  app.use(`${prefix}/users`,       userRoutes);
  app.use(`${prefix}/admin`,       adminRoutes);
  app.use(`${prefix}/analytics`,   analyticsRoutes);
  app.use(`${prefix}/payments`,    paymentRoutes);
  app.use(`${prefix}/upload`,      uploadRoutes);
};

// ── API Routes (Support both /api and /api/v1) ─────────────
registerRoutes('/api');
registerRoutes('/api/v1');

// ── Error Handling ──────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ── Start Server ────────────────────────────────────────────
const PORT = parseInt(process.env.PORT || '5000', 10);

const start = async () => {
  try {
    await connectDB();
    await connectRedis();
    httpServer.listen(PORT, () => {
      console.log(`\n🚀 CHRONEX Server running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV}`);
      console.log(`🔗 API: http://localhost:${PORT}/api & http://localhost:${PORT}/api/v1\n`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

start();
