import { Router } from 'express';
import Category from './category.model';
import slugify from 'slugify';
import { protect, authorize } from '../../middleware/auth.middleware';
import { cacheWrap, getCache, setCache, deleteCache, deleteCachePattern, TTL } from '../../config/redis';

const router = Router();

// GET /api/categories
router.get('/', async (_req, res, next) => {
  try {
    const data = await cacheWrap(
      'categories:all',
      () => Category.find({ isActive: true }).sort('sortOrder').lean(),
      TTL.categories
    );
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

// GET /api/categories/:slug
router.get('/:slug', async (req, res, next) => {
  try {
    const cacheKey = `categories:slug:${req.params.slug}`;
    const data = await cacheWrap(
      cacheKey,
      () => Category.findOne({ slug: req.params.slug, isActive: true }).lean(),
      TTL.categories
    );
    if (!data) return res.status(404).json({ success: false, message: 'Category not found' });
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

// POST /api/categories [Admin]
router.post('/', protect, authorize('admin', 'manager'), async (req, res, next) => {
  try {
    const slug = slugify(req.body.name, { lower: true, strict: true });
    const category = await Category.create({ ...req.body, slug });
    await deleteCachePattern('categories:*');
    res.status(201).json({ success: true, data: category });
  } catch (err) { next(err); }
});

// PUT /api/categories/:id [Admin]
router.put('/:id', protect, authorize('admin', 'manager'), async (req, res, next) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    await deleteCachePattern('categories:*');
    res.json({ success: true, data: category });
  } catch (err) { next(err); }
});

// DELETE /api/categories/:id [Admin]
router.delete('/:id', protect, authorize('admin'), async (req, res, next) => {
  try {
    await Category.findByIdAndUpdate(req.params.id, { isActive: false });
    await deleteCachePattern('categories:*');
    res.json({ success: true, message: 'Category deleted' });
  } catch (err) { next(err); }
});

export default router;
