import { Router } from 'express';
import Coupon from './coupon.model';
import { protect, authorize } from '../../middleware/auth.middleware';
import { cacheWrap, getCache, setCache, deleteCache, deleteCachePattern, TTL } from '../../config/redis';

const couponRoutes = Router();

// ─── POST /api/coupons/validate ───────────────────────────────────────────────

couponRoutes.post('/validate', async (req, res, next) => {
  try {
    const { code, orderValue } = req.body;
    if (!code) return res.status(400).json({ success: false, message: 'Coupon code required' });

    const upperCode = code.toUpperCase();
    const cacheKey = `coupon:${upperCode}`;

    // Check Redis first
    let coupon: any = await getCache(cacheKey);
    if (!coupon) {
      coupon = await Coupon.findOne({ code: upperCode, isActive: true }).lean();
      if (coupon) await setCache(cacheKey, coupon, TTL.coupon);
    }

    if (!coupon) return res.status(404).json({ success: false, message: 'Invalid or expired coupon' });
    if (new Date() > new Date(coupon.expiresAt)) {
      await deleteCache(cacheKey); // remove stale coupon from cache
      return res.status(400).json({ success: false, message: 'Coupon has expired' });
    }
    if (coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ success: false, message: 'Coupon usage limit reached' });
    }
    if (orderValue && orderValue < coupon.minOrderValue) {
      return res.status(400).json({
        success: false,
        message: `Minimum order value for this coupon is $${coupon.minOrderValue}`,
      });
    }

    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = (orderValue * coupon.discount) / 100;
      if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount;
      }
    } else {
      discountAmount = coupon.discount;
    }

    res.json({
      success: true,
      data: coupon,
      discountAmount: Math.round(discountAmount),
    });
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/coupons [Admin] ─────────────────────────────────────────────────

couponRoutes.get('/', protect, authorize('admin'), async (_req, res, next) => {
  try {
    const data = await cacheWrap(
      'coupons:all',
      () => Coupon.find().sort('-createdAt').lean(),
      TTL.coupon
    );
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/coupons [Admin] ────────────────────────────────────────────────

couponRoutes.post('/', protect, authorize('admin'), async (req, res, next) => {
  try {
    const coupon = await Coupon.create(req.body);
    await deleteCachePattern('coupons:*');
    res.status(201).json({ success: true, data: coupon });
  } catch (err) {
    next(err);
  }
});

// ─── PUT /api/coupons/:id [Admin] ─────────────────────────────────────────────

couponRoutes.put('/:id', protect, authorize('admin'), async (req, res, next) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!coupon) return res.status(404).json({ success: false, message: 'Coupon not found' });
    // Invalidate both specific and list caches
    await Promise.all([
      deleteCache(`coupon:${coupon.code}`),
      deleteCachePattern('coupons:*'),
    ]);
    res.json({ success: true, data: coupon });
  } catch (err) {
    next(err);
  }
});

// ─── DELETE /api/coupons/:id [Admin] ──────────────────────────────────────────

couponRoutes.delete('/:id', protect, authorize('admin'), async (req, res, next) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (coupon) await deleteCache(`coupon:${coupon.code}`);
    await deleteCachePattern('coupons:*');
    res.json({ success: true, message: 'Coupon deleted' });
  } catch (err) {
    next(err);
  }
});

export default couponRoutes;
