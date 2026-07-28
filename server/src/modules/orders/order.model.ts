import mongoose, { Document, Schema } from 'mongoose';

export interface IOrderItem {
  product: mongoose.Types.ObjectId;
  name: string;
  brand: string;
  image: string;
  price: number;
  quantity: number;
  variant?: string;
  sku: string;
}

export interface IShippingAddress {
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

export interface IOrder extends Document {
  orderNumber: string;
  user?: mongoose.Types.ObjectId;
  guestEmail?: string;
  items: IOrderItem[];
  shippingAddress: IShippingAddress;
  paymentMethod: 'cod' | 'stripe' | 'paypal' | 'upi';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  stripePaymentIntentId?: string;
  orderStatus: 'placed' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
  statusHistory: { status: string; note?: string; timestamp: Date }[];
  subtotal: number;
  discount: number;
  shippingCost: number;
  tax: number;
  total: number;
  coupon?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  notes?: string;
  giftWrap: boolean;
  estimatedDelivery?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>({
  orderNumber:    { type: String, required: true, unique: true },
  user:           { type: Schema.Types.ObjectId, ref: 'User' },
  guestEmail:     String,
  items: [{
    product:  { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    name:     { type: String, required: true },
    brand:    String,
    image:    String,
    price:    { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    variant:  String,
    sku:      String,
  }],
  shippingAddress: {
    fullName: { type: String, required: true },
    phone:    { type: String, required: true },
    line1:    { type: String, required: true },
    line2:    String,
    city:     { type: String, required: true },
    state:    { type: String, required: true },
    pincode:  { type: String, required: true },
    country:  { type: String, default: 'India' },
  },
  paymentMethod:         { type: String, enum: ['cod','stripe','paypal','upi'], required: true },
  paymentStatus:         { type: String, enum: ['pending','paid','failed','refunded'], default: 'pending' },
  stripePaymentIntentId: String,
  orderStatus: {
    type: String,
    enum: ['placed','confirmed','processing','shipped','delivered','cancelled','returned'],
    default: 'placed',
  },
  statusHistory: [{
    status:    String,
    note:      String,
    timestamp: { type: Date, default: Date.now },
  }],
  subtotal:          { type: Number, required: true },
  discount:          { type: Number, default: 0 },
  shippingCost:      { type: Number, default: 0 },
  tax:               { type: Number, default: 0 },
  total:             { type: Number, required: true },
  coupon:            String,
  trackingNumber:    String,
  trackingUrl:       String,
  notes:             String,
  giftWrap:          { type: Boolean, default: false },
  estimatedDelivery: Date,
}, { timestamps: true });

OrderSchema.index({ user: 1, createdAt: -1 });
OrderSchema.index({ orderNumber: 1 });
OrderSchema.index({ orderStatus: 1 });

export default mongoose.model<IOrder>('Order', OrderSchema);
