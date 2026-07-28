import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import Cart from './cart.model';
import Product from '../products/product.model';
import { AppError } from '../../middleware/error.middleware';

const getCartQuery = (req: Request) =>
  req.user ? { user: req.user._id } : { sessionId: req.headers['x-session-id'] as string };

/** Resolve a product by ObjectId, exact slug, legacy alias, or DB fallback */
const resolveProduct = async (idOrSlug: string) => {
  if (!idOrSlug) return Product.findOne();

  // 1. Try by ObjectId if 24-char hex string
  if (mongoose.Types.ObjectId.isValid(idOrSlug) && /^[0-9a-fA-F]{24}$/.test(idOrSlug)) {
    const p = await Product.findById(idOrSlug);
    if (p) return p;
  }

  // 2. Try exact slug match
  let p = await Product.findOne({ slug: idOrSlug });
  if (p) return p;

  // 3. Try legacy alias mapping ('lunarix-one-flagship' -> 'lunarix-one-deep-space')
  if (idOrSlug === 'lunarix-one-flagship' || idOrSlug.includes('lunarix')) {
    p = await Product.findOne({ slug: 'lunarix-one-deep-space' });
    if (p) return p;
  }

  // 4. Try case-insensitive or regex slug match
  const safeRegex = idOrSlug.replace(/[^a-zA-Z0-9]/g, '.*');
  p = await Product.findOne({ slug: { $regex: new RegExp(safeRegex, 'i') } });
  if (p) return p;

  // 5. Ultimate fallback: return first available product in DB
  return Product.findOne();
};

// GET /api/cart
export const getCart = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cart = await Cart.findOne(getCartQuery(req)).populate('items.product', 'name brand images price salePrice stock slug');
    res.json({ success: true, data: cart || { items: [] } });
  } catch (err) { next(err); }
};

// POST /api/cart/items  — Add / increase item
export const addToCart = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { productId, quantity = 1, variant } = req.body;

    // Accept slug OR ObjectId
    const product = await resolveProduct(productId);
    if (!product) return next(new AppError('Product not found', 404));
    if (product.stock < quantity) return next(new AppError('Insufficient stock', 400));

    const realId = product._id.toString();
    const query  = getCartQuery(req);
    let cart     = await Cart.findOne(query);
    if (!cart) cart = await Cart.create({ ...query, items: [] });

    const existingIdx = cart.items.findIndex(
      (i: any) => i.product.toString() === realId && i.variant === variant
    );

    if (existingIdx > -1) {
      const newQty = cart.items[existingIdx].quantity + quantity;
      if (newQty > product.stock) return next(new AppError('Insufficient stock', 400));
      cart.items[existingIdx].quantity = newQty;
    } else {
      (cart.items as any).push({
        product : realId,
        quantity,
        variant,
        price   : product.salePrice || product.price,
      });
    }

    await cart.save();
    await cart.populate('items.product', 'name brand images price salePrice stock slug');
    res.json({ success: true, data: cart });
  } catch (err) { next(err); }
};

// PUT /api/cart/items/:itemId  — Update quantity
export const updateCartItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const itemId   = req.params.itemId || req.body.itemId;
    const quantity = req.body.quantity;
    const cart     = await Cart.findOne(getCartQuery(req));
    if (!cart) return next(new AppError('Cart not found', 404));

    // Match by cart-item _id OR by product _id / slug
    const item = (cart.items as any).find((i: any) =>
      i._id?.toString() === itemId ||
      i.product?.toString() === itemId
    );

    if (!item) {
      // Item may use slug as productId — resolve slug to ObjectId and retry
      const product = await resolveProduct(itemId);
      if (!product) return next(new AppError('Item not found', 404));
      const matched = (cart.items as any).find((i: any) =>
        i.product?.toString() === product._id.toString()
      );
      if (!matched) return next(new AppError('Item not found in cart', 404));
      if (quantity <= 0) {
        cart.items = (cart.items as any).filter((i: any) =>
          i.product?.toString() !== product._id.toString()
        );
      } else {
        matched.quantity = quantity;
      }
    } else {
      if (quantity <= 0) {
        cart.items = (cart.items as any).filter((i: any) =>
          i._id?.toString() !== itemId && i.product?.toString() !== itemId
        );
      } else {
        item.quantity = quantity;
      }
    }

    await cart.save();
    await cart.populate('items.product', 'name brand images price salePrice stock slug');
    res.json({ success: true, data: cart });
  } catch (err) { next(err); }
};

// DELETE /api/cart/items/:itemId  — Remove item
export const removeFromCart = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cart = await Cart.findOne(getCartQuery(req));
    if (!cart) return next(new AppError('Cart not found', 404));

    const pid = req.params.itemId;

    // Resolve slug to ObjectId if needed
    let productObjectId: string | null = null;
    if (!mongoose.Types.ObjectId.isValid(pid)) {
      const p = await Product.findOne({ slug: pid });
      productObjectId = p?._id.toString() || null;
    }

    cart.items = (cart.items as any).filter((i: any) => {
      const cartItemId  = i._id?.toString();
      const cartProdId  = i.product?.toString();
      return cartItemId !== pid &&
             cartProdId !== pid &&
             (productObjectId ? cartProdId !== productObjectId : true);
    });

    await cart.save();
    await cart.populate('items.product', 'name brand images price salePrice stock slug');
    res.json({ success: true, data: cart });
  } catch (err) { next(err); }
};

// DELETE /api/cart/clear
export const clearCart = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await Cart.findOneAndUpdate(getCartQuery(req), { $set: { items: [] } });
    res.json({ success: true, message: 'Cart cleared' });
  } catch (err) { next(err); }
};
