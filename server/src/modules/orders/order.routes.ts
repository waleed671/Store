import { Router } from 'express';
import { createOrder, getMyOrders, getOrder, cancelOrder, getAllOrders, updateOrderStatus } from './order.controller';
import { protect, authorize, optionalAuth } from '../../middleware/auth.middleware';

const router = Router();

router.post('/', optionalAuth, createOrder);
router.get('/my-orders', protect, getMyOrders);
router.get('/me', protect, getMyOrders);
router.get('/:id', optionalAuth, getOrder);
router.post('/:id/cancel', protect, cancelOrder);

// Admin or General GET /api/orders
router.get('/', optionalAuth, async (req: any, res: any, next: any) => {
  if (!req.user || ['admin', 'manager', 'staff'].includes(req.user.role)) {
    return getAllOrders(req, res, next);
  }
  return getMyOrders(req, res, next);
});

router.put('/:id/status', optionalAuth, updateOrderStatus);

export default router;
