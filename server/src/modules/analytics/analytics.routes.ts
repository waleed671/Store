import { Router } from 'express';
import { protect, authorize } from '../../middleware/auth.middleware';
import Order from '../orders/order.model';

const analyticsRoutes = Router();
analyticsRoutes.use(protect, authorize('admin', 'manager'));

// Sales Analytics breakdown
analyticsRoutes.get('/sales', async (_req, res, next) => {
  try {
    const monthlySales = await Order.aggregate([
      {
        $group: {
          _id: { $month: '$createdAt' },
          totalSales: { $sum: '$totalAmount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({ success: true, data: monthlySales });
  } catch (err) {
    next(err);
  }
});

export default analyticsRoutes;
