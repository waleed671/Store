import mongoose, { Document, Schema } from 'mongoose';

export interface ICoupon extends Document {
  code: string;
  discount: number;
  discountType: 'percentage' | 'fixed';
  minOrderValue: number;
  maxDiscount?: number;
  usageLimit: number;
  usedCount: number;
  expiresAt: Date;
  isActive: boolean;
  applicableCategories: mongoose.Types.ObjectId[];
  description?: string;
}

const CouponSchema = new Schema<ICoupon>({
  code:          { type: String, required: true, unique: true, uppercase: true },
  discount:      { type: Number, required: true },
  discountType:  { type: String, enum: ['percentage','fixed'], required: true },
  minOrderValue: { type: Number, default: 0 },
  maxDiscount:   Number,
  usageLimit:    { type: Number, default: 100 },
  usedCount:     { type: Number, default: 0 },
  expiresAt:     { type: Date, required: true },
  isActive:      { type: Boolean, default: true },
  applicableCategories: [{ type: Schema.Types.ObjectId, ref: 'Category' }],
  description:   String,
}, { timestamps: true });

export default mongoose.model<ICoupon>('Coupon', CouponSchema);
