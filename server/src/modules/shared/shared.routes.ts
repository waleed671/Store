// Shared routes — Collections, Reviews, Wishlist, User, Analytics, Payment, Upload

import { Router } from 'express';
import mongoose, { Schema } from 'mongoose';
import slugify from 'slugify';
import { protect, authorize, optionalAuth } from '../../middleware/auth.middleware';
import User from '../users/user.model';
import { cacheWrap, getCache, setCache, deleteCache, deleteCachePattern, TTL } from '../../config/redis';

// ── Collection Model ──────────────────────────────────────────────────────────

const CollectionSchema = new Schema({
  name:        { type: String, required: true },
  slug:        { type: String, required: true, unique: true, lowercase: true },
  description: String,
  image:       String,
  banner:      String,
  isActive:    { type: Boolean, default: true },
  isFeatured:  { type: Boolean, default: false },
}, { timestamps: true });
const Collection = mongoose.model('Collection', CollectionSchema);

export const collectionRoutes = Router();

// GET /api/collections
collectionRoutes.get('/', async (_req, res, next) => {
  try {
    const data = await cacheWrap(
      'collections:all',
      () => Collection.find({ isActive: true }).lean(),
      TTL.collections
    );
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

// GET /api/collections/:slug
collectionRoutes.get('/:slug', async (req, res, next) => {
  try {
    const data = await cacheWrap(
      `collections:slug:${req.params.slug}`,
      () => Collection.findOne({ slug: req.params.slug }).lean(),
      TTL.collections
    );
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

// POST /api/collections [Admin]
collectionRoutes.post('/', protect, authorize('admin', 'manager'), async (req, res, next) => {
  try {
    const c = await Collection.create({ ...req.body, slug: slugify(req.body.name, { lower: true }) });
    await deleteCachePattern('collections:*');
    res.status(201).json({ success: true, data: c });
  } catch (err) { next(err); }
});

// PUT /api/collections/:id [Admin]
collectionRoutes.put('/:id', protect, authorize('admin', 'manager'), async (req, res, next) => {
  try {
    const c = await Collection.findByIdAndUpdate(req.params.id, req.body, { new: true });
    await deleteCachePattern('collections:*');
    res.json({ success: true, data: c });
  } catch (err) { next(err); }
});

// DELETE /api/collections/:id [Admin]
collectionRoutes.delete('/:id', protect, authorize('admin'), async (req, res, next) => {
  try {
    await Collection.findByIdAndUpdate(req.params.id, { isActive: false });
    await deleteCachePattern('collections:*');
    res.json({ success: true, message: 'Collection deleted' });
  } catch (err) { next(err); }
});

// ── Review Model ──────────────────────────────────────────────────────────────

const ReviewSchema = new Schema({
  product:  { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  user:     { type: Schema.Types.ObjectId, ref: 'User', required: true },
  rating:   { type: Number, required: true, min: 1, max: 5 },
  title:    String,
  comment:  { type: String, required: true },
  images:   [String],
  isVerifiedPurchase: { type: Boolean, default: false },
  helpfulVotes: { type: Number, default: 0 },
  status:   { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
}, { timestamps: true });
ReviewSchema.index({ product: 1, user: 1 }, { unique: true });
const Review = mongoose.model('Review', ReviewSchema);

export const reviewRoutes = Router();

// GET /api/reviews/product/:productId
reviewRoutes.get('/product/:productId', async (req, res, next) => {
  try {
    const cacheKey = `reviews:product:${req.params.productId}`;
    const data = await cacheWrap(
      cacheKey,
      () => Review.find({ product: req.params.productId, status: 'approved' })
              .populate('user', 'name avatar')
              .sort('-createdAt')
              .lean(),
      300 // 5 min
    );
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

// POST /api/reviews
reviewRoutes.post('/', protect, async (req, res, next) => {
  try {
    const review = await Review.create({ ...req.body, user: req.user._id });
    // Invalidate product reviews cache
    await deleteCache(`reviews:product:${req.body.product}`);
    res.status(201).json({ success: true, data: review });
  } catch (err) { next(err); }
});

// PUT /api/reviews/:id/status [Admin]
reviewRoutes.put('/:id/status', protect, authorize('admin'), async (req, res, next) => {
  try {
    const r = await Review.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    if (r) await deleteCache(`reviews:product:${r.product}`);
    res.json({ success: true, data: r });
  } catch (err) { next(err); }
});

// ── Wishlist Routes ───────────────────────────────────────────────────────────

export const wishlistRoutes = Router();
wishlistRoutes.use(protect);

// GET /api/wishlist
wishlistRoutes.get('/', async (req, res, next) => {
  try {
    const cacheKey = `wishlist:user:${req.user._id}`;
    const cached = await getCache(cacheKey);
    if (cached) return res.json({ success: true, data: cached, cached: true });

    const user = await User.findById(req.user._id)
      .populate('wishlist', 'name brand images price salePrice slug ratings stock');
    const wishlistData = user?.wishlist || [];
    await setCache(cacheKey, wishlistData, 120); // 2 min
    res.json({ success: true, data: wishlistData });
  } catch (err) { next(err); }
});

// POST /api/wishlist/toggle/:productId
wishlistRoutes.post('/toggle/:productId', async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const pid = req.params.productId as any;
    const idx = user!.wishlist.indexOf(pid);
    if (idx > -1) {
      user!.wishlist.splice(idx, 1);
    } else {
      user!.wishlist.push(pid);
    }
    await user!.save();
    // Invalidate user wishlist cache
    await deleteCache(`wishlist:user:${req.user._id}`);
    res.json({ success: true, inWishlist: idx === -1, wishlist: user!.wishlist });
  } catch (err) { next(err); }
});

// ── User (Account) Routes ─────────────────────────────────────────────────────

export const userRoutes = Router();
userRoutes.use(protect);

// GET /api/users/profile
userRoutes.get('/profile', (req, res) => {
  res.json({ success: true, data: req.user });
});

// PUT /api/users/profile
userRoutes.put('/profile', async (req, res, next) => {
  try {
    const { name, phone, avatar } = req.body;
    const user = await User.findByIdAndUpdate(req.user._id, { name, phone, avatar }, { new: true });
    // Invalidate user session/profile cache
    await deleteCache(`session:${req.user._id}`);
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
});

// PUT /api/users/change-password
userRoutes.put('/change-password', async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');
    if (!user || !(await user.comparePassword(currentPassword))) {
      return res.status(400).json({ success: false, message: 'Wrong current password' });
    }
    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (err) { next(err); }
});

// POST /api/users/addresses
userRoutes.post('/addresses', async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (req.body.isDefault) user!.addresses.forEach(a => { a.isDefault = false; });
    user!.addresses.push(req.body);
    await user!.save();
    res.json({ success: true, data: user!.addresses });
  } catch (err) { next(err); }
});

// PUT /api/users/addresses/:addressId
userRoutes.put('/addresses/:addressId', async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const addr = (user!.addresses as any).find((a: any) => a._id?.toString() === req.params.addressId);
    if (!addr) return res.status(404).json({ success: false, message: 'Address not found' });
    if (req.body.isDefault) user!.addresses.forEach((a: any) => { a.isDefault = false; });
    Object.assign(addr, req.body);
    await user!.save();
    res.json({ success: true, data: user!.addresses });
  } catch (err) { next(err); }
});

// DELETE /api/users/addresses/:addressId
userRoutes.delete('/addresses/:addressId', async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    user!.addresses = (user!.addresses as any).filter((a: any) => a._id?.toString() !== req.params.addressId);
    await user!.save();
    res.json({ success: true, data: user!.addresses });
  } catch (err) { next(err); }
});
