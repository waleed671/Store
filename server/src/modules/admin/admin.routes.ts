import { Router } from 'express';
import { protect, authorize, optionalAuth } from '../../middleware/auth.middleware';
import User from '../users/user.model';
import Order from '../orders/order.model';
import Product from '../products/product.model';
import Category from '../categories/category.model';
import Coupon from '../coupons/coupon.model';
import { getCache, setCache, deleteCache, deleteCachePattern, TTL } from '../../config/redis';

const adminRoutes = Router();

// ─── GET /api/admin/stats — Dashboard Summary ─────────────────────────────────

adminRoutes.get('/stats', async (_req, res, next) => {
  try {
    const CACHE_KEY = 'admin:stats';
    const cached = await getCache(CACHE_KEY);
    if (cached) {
      return res.json({ success: true, data: cached, cached: true });
    }

    const [totalUsers, totalProducts, totalOrders, pendingOrders, revenueResult, recentOrders] =
      await Promise.all([
        User.countDocuments(),
        Product.countDocuments({ isActive: true }),
        Order.countDocuments(),
        Order.countDocuments({ orderStatus: { $in: ['placed', 'confirmed', 'processing'] } }),
        Order.aggregate([
          { $match: { orderStatus: { $ne: 'cancelled' } } },
          { $group: { _id: null, totalRevenue: { $sum: '$total' } } },
        ]),
        Order.find()
          .sort('-createdAt')
          .limit(10)
          .populate('user', 'name email')
          .lean(),
      ]);

    const totalRevenue = revenueResult[0]?.totalRevenue || 0;

    // Revenue by day (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const dailyRevenue = await Order.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo }, orderStatus: { $ne: 'cancelled' } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$total' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Orders by status
    const ordersByStatus = await Order.aggregate([
      { $group: { _id: '$orderStatus', count: { $sum: 1 } } },
    ]);

    const statsData = {
      totalUsers,
      totalProducts,
      totalOrders,
      pendingOrders,
      totalRevenue,
      recentOrders,
      dailyRevenue,
      ordersByStatus,
    };

    await setCache(CACHE_KEY, statsData, TTL.adminStats);

    res.json({ success: true, data: statsData });
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/admin/users — All Users ────────────────────────────────────────

adminRoutes.get('/users', protect, authorize('admin', 'manager'), async (_req, res, next) => {
  try {
    const CACHE_KEY = 'admin:users';
    const cached = await getCache(CACHE_KEY);
    if (cached) return res.json({ success: true, data: cached, cached: true });

    const users = await User.find().select('-password -refreshToken').sort('-createdAt');
    await setCache(CACHE_KEY, users, 120); // 2 min
    res.json({ success: true, data: users });
  } catch (err) {
    next(err);
  }
});

// ─── PUT /api/admin/orders/:id/status — Update Order Status ─────────────────

adminRoutes.put('/orders/:id/status', protect, authorize('admin', 'manager'), async (req, res, next) => {
  try {
    const { status, note } = req.body;
    const validStatuses = ['placed', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'];
    if (!validStatuses.includes(status)) {
      return next(new Error('Invalid order status'));
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        orderStatus: status,
        $push: { statusHistory: { status, note: note || '', timestamp: new Date() } },
      },
      { new: true }
    ).populate('user', 'name email');

    if (!order) return next(new Error('Order not found'));

    // Invalidate admin stats cache so dashboard refreshes
    await deleteCache('admin:stats');

    res.json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
});

// ─── PUT /api/admin/users/:id/block — Block/Unblock User ────────────────────

adminRoutes.put('/users/:id/block', protect, authorize('admin'), async (req, res, next) => {
  try {
    const { isBlocked } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { isBlocked }, { new: true }).select('-password');
    if (!user) return next(new Error('User not found'));

    await deleteCache('admin:users');
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
});

// ─── PUT /api/admin/products/:id — Edit Product Details ─────────────────────

adminRoutes.put('/products/:id', async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    await Promise.all([
      deleteCachePattern('products:*'),
      deleteCachePattern('product:*'),
      deleteCache('admin:stats'),
    ]);

    res.json({ success: true, data: product });
  } catch (err) { next(err); }
});

// ─── PUT /api/admin/products/:id/stock — Quick Stock Update ──────────────────

adminRoutes.put('/products/:id/stock', async (req, res, next) => {
  try {
    const { stock } = req.body;
    const product = await Product.findByIdAndUpdate(req.params.id, { stock: Number(stock) }, { new: true });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    await deleteCachePattern('products:*');
    res.json({ success: true, data: product });
  } catch (err) { next(err); }
});

// ─── DELETE /api/admin/products/:id — Delete Product ─────────────────────────

adminRoutes.delete('/products/:id', async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    await Promise.all([
      deleteCachePattern('products:*'),
      deleteCachePattern('product:*'),
      deleteCache('admin:stats'),
    ]);
    res.json({ success: true, message: 'Product deleted successfully', data: product });
  } catch (err) { next(err); }
});

// ─── GET /api/admin/categories — List All Categories ─────────────────────────

adminRoutes.get('/categories', async (_req, res, next) => {
  try {
    const categories = await Category.find().sort('name').lean();
    res.json({ success: true, data: categories });
  } catch (err) { next(err); }
});

// ─── POST /api/admin/categories — Create Category ───────────────────────────

adminRoutes.post('/categories', async (req, res, next) => {
  try {
    const category = await Category.create(req.body);
    await deleteCachePattern('categories:*');
    res.status(201).json({ success: true, data: category });
  } catch (err) { next(err); }
});

// ─── DELETE /api/admin/categories/:id — Delete Category ──────────────────────

adminRoutes.delete('/categories/:id', async (req, res, next) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    await deleteCachePattern('categories:*');
    res.json({ success: true, message: 'Category deleted' });
  } catch (err) { next(err); }
});

// ─── GET /api/admin/coupons — List All Coupons ───────────────────────────────

adminRoutes.get('/coupons', async (_req, res, next) => {
  try {
    const coupons = await Coupon.find().sort('-createdAt').lean();
    res.json({ success: true, data: coupons });
  } catch (err) { next(err); }
});

// ─── POST /api/admin/coupons — Create Coupon ─────────────────────────────────

adminRoutes.post('/coupons', async (req, res, next) => {
  try {
    const coupon = await Coupon.create(req.body);
    await deleteCachePattern('coupons:*');
    res.status(201).json({ success: true, data: coupon });
  } catch (err) { next(err); }
});

// ─── DELETE /api/admin/coupons/:id — Delete Coupon ────────────────────────────

adminRoutes.delete('/coupons/:id', async (req, res, next) => {
  try {
    await Coupon.findByIdAndDelete(req.params.id);
    await deleteCachePattern('coupons:*');
    res.json({ success: true, message: 'Coupon deleted' });
  } catch (err) { next(err); }
});

// ─── DELETE /api/admin/cache — Manual Cache Flush ────────────────────────────

adminRoutes.delete('/cache', async (_req, res, next) => {
  try {
    const cleared = await Promise.all([
      deleteCachePattern('products:*'),
      deleteCachePattern('product:*'),
      deleteCachePattern('admin:*'),
      deleteCachePattern('categories:*'),
      deleteCachePattern('collections:*'),
    ]);
    res.json({
      success: true,
      message: `Cache cleared — ${cleared.reduce((a, b) => a + b, 0)} keys removed`,
    });
  } catch (err) {
    next(err);
  }
});

export default adminRoutes;
