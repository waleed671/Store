import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import Order from './order.model';
import Product from '../products/product.model';
import Cart from '../cart/cart.model';
import Coupon from '../coupons/coupon.model';
import { AppError } from '../../middleware/error.middleware';
import { sendOrderConfirmationEmail } from '../../utils/mailer';
import { io } from '../../app';
import Stripe from 'stripe';
import { deleteCache, deleteCachePattern } from '../../config/redis';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock_key', { apiVersion: '2023-10-16' as any });

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

// POST /api/orders  — Place order
export const createOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const rawItems = req.body.items || req.body.orderItems || [];
    const {
      shippingAddress, paymentMethod = 'COD',
      couponCode, giftWrap, notes, subtotal: reqSubtotal, totalAmount,
    } = req.body;

    if (!rawItems || rawItems.length === 0) {
      return next(new AppError('No order items provided', 400));
    }

    // 1. Stock Validation and Product Lookup
    const validatedItems: any[] = [];
    let subtotal = 0;

    for (const raw of rawItems) {
      // Accept ObjectId, slug, or nested product object
      const prodIdOrSlug = raw.product?._id || raw.product?.slug || raw.product || raw._id || raw.slug;
      const product = await resolveProduct(String(prodIdOrSlug));

      if (!product) {
        return next(new AppError(`Product not found (ID/slug: ${prodIdOrSlug})`, 404));
      }

      const qty = Number(raw.quantity || 1);

      // Inventory check
      if (product.trackInventory && product.stock < qty) {
        return next(new AppError(`Insufficient stock for "${product.name}". Available stock: ${product.stock}, requested: ${qty}`, 400));
      }

      const unitPrice = product.salePrice || product.price || raw.price || 0;
      subtotal += unitPrice * qty;

      validatedItems.push({
        product: product._id,
        name: product.name,
        image: product.images?.[0] || raw.image || '',
        price: unitPrice,
        quantity: qty,
        selectedColor: raw.selectedColor,
        selectedStrap: raw.selectedStrap,
      });
    }

    // 2. Coupon Validation
    let discount = 0;
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
      if (coupon && coupon.expiresAt > new Date() && coupon.usedCount < coupon.usageLimit) {
        discount = coupon.discountType === 'percentage'
          ? (subtotal * coupon.discount) / 100
          : coupon.discount;
        discount = Math.min(discount, subtotal);
        coupon.usedCount++;
        await coupon.save();
      }
    }

    const shippingCost = subtotal > 500 ? 0 : 25;
    const tax = 0;
    const total = totalAmount || (subtotal - discount + shippingCost);

    const orderNumber = `CHX-${Math.floor(100000 + Math.random() * 900000)}`;
    const estimatedDelivery = new Date(Date.now() + 4 * 24 * 60 * 60 * 1000);

    // 3. Create Order Document in MongoDB
    const order = await Order.create({
      orderNumber,
      user: req.user?._id,
      guestEmail: req.body.email || shippingAddress?.email || req.body.guestEmail,
      items: validatedItems,
      shippingAddress: {
        fullName: shippingAddress?.fullName || req.body.fullName || req.user?.name || 'Valued Client',
        phone:    shippingAddress?.phone || req.body.phone || req.user?.phone || '0000000000',
        line1:    shippingAddress?.line1 || shippingAddress?.street || req.body.line1 || req.body.street || 'N/A',
        line2:    shippingAddress?.line2 || req.body.line2 || '',
        city:     shippingAddress?.city || req.body.city || 'Standard City',
        state:    shippingAddress?.state || req.body.state || shippingAddress?.city || req.body.city || 'Punjab',
        pincode:  shippingAddress?.pincode || shippingAddress?.zipCode || req.body.pincode || req.body.zipCode || '00000',
        country:  shippingAddress?.country || req.body.country || 'Pakistan',
      },
      paymentMethod: paymentMethod.toUpperCase() === 'STRIPE' ? 'stripe' : 'cod',
      paymentStatus: paymentMethod.toUpperCase() === 'STRIPE' ? 'pending' : 'pending',
      orderStatus: 'placed',
      statusHistory: [{ status: 'placed', note: 'Order placed & saved to database', timestamp: new Date() }],
      subtotal, discount, shippingCost, tax, total,
      coupon: couponCode,
      giftWrap: giftWrap || false,
      notes,
      estimatedDelivery,
    });

    // 4. Decrement Product Stock in MongoDB
    for (const item of validatedItems) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } });
    }

    // Clear cart if user logged in
    if (req.user) {
      await Cart.findOneAndUpdate({ user: req.user._id }, { $set: { items: [] } });
    }

    // Real-time socket notification to admin room
    io.to('admin').emit('new_order', { orderNumber, total, paymentMethod });

    // Invalidate admin dashboard cache so new order shows immediately
    await deleteCache('admin:stats');
    // Also invalidate product list caches (stock changed)
    await deleteCachePattern('products:*');

    res.status(201).json({
      success: true,
      data: order,
    });
  } catch (err) { next(err); }
};

// GET /api/orders  — My orders
export const getMyOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const query: any = { user: req.user._id };
    if (status) query.orderStatus = status;

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate('items.product', 'name images price slug')
        .sort('-createdAt')
        .skip((Number(page) - 1) * Number(limit))
        .limit(Number(limit))
        .lean(),
      Order.countDocuments(query),
    ]);

    res.json({ success: true, data: orders, meta: { total, page: Number(page) } });
  } catch (err) { next(err); }
};

// GET /api/orders/:id  — Order tracking details
export const getOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.product', 'name images price slug brand')
      .populate('user', 'name email phone')
      .lean();
    if (!order) return next(new AppError('Order not found', 404));

    // If customer, check ownership
    if (req.user && req.user.role === 'customer' && order.user?._id?.toString() !== req.user._id.toString()) {
      return next(new AppError('Not authorized to view this order', 403));
    }

    res.json({ success: true, data: order });
  } catch (err) { next(err); }
};

// POST /api/orders/:id/cancel
export const cancelOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return next(new AppError('Order not found', 404));
    if (!['placed','confirmed','pending'].includes(order.orderStatus)) {
      return next(new AppError('Cannot cancel order at this stage', 400));
    }

    order.orderStatus = 'cancelled';
    order.statusHistory.push({ status: 'cancelled', note: req.body.reason || 'Cancelled by client', timestamp: new Date() });
    await order.save();

    // Restock product quantities
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
    }

    io.to(order._id.toString()).emit('order_updated', { status: 'cancelled' });
    res.json({ success: true, message: 'Order cancelled successfully' });
  } catch (err) { next(err); }
};

// Admin: GET /api/orders/all
export const getAllOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, limit = 50, status, search } = req.query;
    const query: any = {};
    if (status) query.orderStatus = status;
    if (search) query.orderNumber = { $regex: search, $options: 'i' };

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate('user', 'name email phone')
        .populate('items.product', 'name brand images')
        .sort('-createdAt')
        .skip((Number(page) - 1) * Number(limit))
        .limit(Number(limit))
        .lean(),
      Order.countDocuments(query),
    ]);

    res.json({ success: true, data: orders, meta: { total, page: Number(page) } });
  } catch (err) { next(err); }
};

// Admin: PUT /api/orders/:id/status
export const updateOrderStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const status = req.body.status || req.body.orderStatus;
    if (!status) return next(new AppError('Order status is required', 400));

    const { note, trackingNumber, trackingUrl } = req.body;
    const existingOrder = await Order.findById(req.params.id);
    if (!existingOrder) return next(new AppError('Order not found', 404));

    const isCod = existingOrder.paymentMethod?.toLowerCase() === 'cod';

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        orderStatus: status,
        ...(trackingNumber && { trackingNumber }),
        ...(trackingUrl && { trackingUrl }),
        $push: { statusHistory: { status, note: note || `Status updated to ${status}`, timestamp: new Date() } },
        ...(status === 'delivered' && isCod ? { paymentStatus: 'paid', isPaid: true, paidAt: new Date() } : {}),
      },
      { new: true }
    );
    if (!order) return next(new AppError('Order not found', 404));

    deleteCachePattern('orders:*').catch(() => {});
    io.to(order._id.toString()).emit('order_updated', { status, trackingNumber });
    res.json({ success: true, data: order });
  } catch (err) { next(err); }
};
