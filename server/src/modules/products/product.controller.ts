import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import Product from './product.model';
import Category from '../categories/category.model';
import { AppError } from '../../middleware/error.middleware';
import { cacheWrap, deleteCache, deleteCachePattern, setCache, getCache, TTL } from '../../config/redis';
import slugify from 'slugify';

// ─── Cache Key Builders ───────────────────────────────────────────────────────

const buildProductListKey = (query: any): string => {
  const parts = [
    query.page || 1,
    query.limit || 12,
    query.sort || '-createdAt',
    query.brand || '',
    query.category || '',
    query.collection || '',
    query.minPrice || '',
    query.maxPrice || '',
    query.gender || '',
    query.movement || '',
    query.inStock || '',
    query.isFeatured || '',
    query.isNewArrival || '',
    query.isLimitedEdition || '',
    query.isBestSeller || '',
    query.search || '',
    query.rating || '',
  ].join(':');
  return `products:list:${parts}`;
};

// ─── GET /api/products ────────────────────────────────────────────────────────

export const getProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      page = 1, limit = 12, sort = '-createdAt',
      brand, category, collection, minPrice, maxPrice,
      gender, movement, waterResistance, inStock,
      isFeatured, isNewArrival, isLimitedEdition, isBestSeller,
      search, rating,
    } = req.query;

    const mongoQuery: any = { isActive: true };

    if (search) mongoQuery.$text = { $search: search as string };
    if (brand) mongoQuery.brand = { $in: (brand as string).split(',') };
    if (category) mongoQuery.category = category;
    if (collection) mongoQuery.collection = collection;
    if (gender) mongoQuery.gender = gender;
    if (movement) mongoQuery.movement = movement;
    if (waterResistance) mongoQuery.waterResistance = waterResistance;
    if (inStock === 'true') mongoQuery.stock = { $gt: 0 };
    if (isFeatured === 'true') mongoQuery.isFeatured = true;
    if (isNewArrival === 'true') mongoQuery.isNewArrival = true;
    if (isLimitedEdition === 'true') mongoQuery.isLimitedEdition = true;
    if (isBestSeller === 'true') mongoQuery.isBestSeller = true;
    if (minPrice || maxPrice) {
      mongoQuery.price = {};
      if (minPrice) mongoQuery.price.$gte = Number(minPrice);
      if (maxPrice) mongoQuery.price.$lte = Number(maxPrice);
    }
    if (rating) mongoQuery.ratings = { $gte: Number(rating) };

    const skip = (Number(page) - 1) * Number(limit);
    const cacheKey = buildProductListKey(req.query);

    // Don't cache search queries (dynamic results)
    if (!search) {
      const cached = await getCache(cacheKey);
      if (cached) {
        return res.json({ ...cached, cached: true });
      }
    }

    const [products, total] = await Promise.all([
      Product.find(mongoQuery)
        .populate('category', 'name slug')
        .populate('collection', 'name slug')
        .sort(sort as string)
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Product.countDocuments(mongoQuery),
    ]);

    const responseData = {
      success: true,
      data: products,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    };

    if (!search) {
      await setCache(cacheKey, responseData, TTL.products);
    }

    res.json(responseData);
  } catch (err) { next(err); }
};

// ─── GET /api/products/featured ───────────────────────────────────────────────

export const getFeaturedProducts = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await cacheWrap(
      'products:featured',
      () => Product.find({ isFeatured: true, isActive: true })
              .limit(8)
              .populate('category', 'name slug')
              .lean(),
      TTL.featured
    );
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

// ─── GET /api/products/:slug ──────────────────────────────────────────────────

export const getProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cacheKey = `product:slug:${req.params.slug}`;
    const cached = await getCache(cacheKey);
    if (cached) {
      return res.json({ success: true, data: cached, cached: true });
    }

    const product = await Product.findOne({ slug: req.params.slug, isActive: true })
      .populate('category', 'name slug')
      .populate('collection', 'name slug')
      .lean();

    if (!product) return next(new AppError('Product not found', 404));

    await setCache(cacheKey, product, TTL.products);
    res.json({ success: true, data: product });
  } catch (err) { next(err); }
};

// ─── GET /api/products/:id/related ───────────────────────────────────────────

export const getRelatedProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cacheKey = `products:related:${req.params.id}`;
    const cached = await getCache(cacheKey);
    if (cached) return res.json({ success: true, data: cached, cached: true });

    const product = await Product.findById(req.params.id);
    if (!product) return next(new AppError('Product not found', 404));

    const related = await Product.find({
      category: product.category,
      _id: { $ne: product._id },
      isActive: true,
    }).limit(8).lean();

    await setCache(cacheKey, related, TTL.products);
    res.json({ success: true, data: related });
  } catch (err) { next(err); }
};

// ─── POST /api/products [Admin] ───────────────────────────────────────────────

export const createProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, price, brand = 'CHRONEX', description, category, images, stock = 10 } = req.body;

    if (!name || !price) {
      return next(new AppError('Product name and price are required', 400));
    }

    // 1. Auto-generate unique SKU if missing
    let sku = req.body.sku;
    if (!sku) {
      const cleanName = slugify(name, { replacement: '' }).toUpperCase().substring(0, 8);
      sku = `CHX-${cleanName}-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    // 2. Resolve Category ObjectId if category slug or string passed
    let categoryObjectId: any = category;
    if (!category || !mongoose.Types.ObjectId.isValid(category)) {
      const catSearch = category || 'lunarix-one';
      let foundCat = await Category.findOne({
        $or: [
          { slug: slugify(catSearch, { lower: true }) },
          { name: { $regex: new RegExp(catSearch, 'i') } },
        ],
      });
      if (!foundCat) {
        foundCat = await Category.create({
          name: typeof category === 'string' ? category : 'Luxury Series',
          slug: slugify(typeof category === 'string' ? category : 'luxury-series', { lower: true }),
        });
      }
      categoryObjectId = foundCat._id;
    }

    // 3. Unique slug generation
    let baseSlug = slugify(name, { lower: true, strict: true }) || 'chronex-watch';
    let slug = baseSlug;
    const existingSlugCount = await Product.countDocuments({ slug });
    if (existingSlugCount > 0) {
      slug = `${baseSlug}-${Math.floor(100 + Math.random() * 900)}`;
    }

    // 4. Create Product Document
    const product = await Product.create({
      ...req.body,
      name,
      brand,
      sku,
      slug,
      price: Number(price),
      salePrice: req.body.salePrice ? Number(req.body.salePrice) : undefined,
      category: categoryObjectId,
      stock: Number(stock),
      description: description || `${name} — Premium manufacture horology timepiece by CHRONEX.`,
      images: Array.isArray(images) && images.length > 0
        ? images
        : [typeof req.body.image === 'string' && req.body.image.trim() ? req.body.image : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1000&auto=format&fit=crop&q=80'],
      isActive: true,
      trackInventory: true,
    });

    // Invalidate all product list caches & admin stats cache
    await Promise.all([
      deleteCachePattern('products:*'),
      deleteCache('admin:stats'),
    ]);

    res.status(201).json({ success: true, data: product });
  } catch (err) { next(err); }
};

// ─── PUT /api/products/:id [Admin] ───────────────────────────────────────────

export const updateProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.body.name) {
      req.body.slug = slugify(req.body.name, { lower: true, strict: true });
    }
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!product) return next(new AppError('Product not found', 404));

    // Invalidate specific product cache AND all product lists
    await Promise.all([
      deleteCache(`product:slug:${product.slug}`),
      deleteCache(`products:related:${req.params.id}`),
      deleteCachePattern('products:*'),
    ]);

    res.json({ success: true, data: product });
  } catch (err) { next(err); }
};

// ─── DELETE /api/products/:id [Admin] ────────────────────────────────────────

export const deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, { isActive: false });
    if (!product) return next(new AppError('Product not found', 404));

    await Promise.all([
      deleteCache(`product:slug:${product.slug}`),
      deleteCachePattern('products:*'),
    ]);

    res.json({ success: true, message: 'Product deleted' });
  } catch (err) { next(err); }
};
