import mongoose, { Document, Schema } from 'mongoose';

export interface ICartItem {
  product: mongoose.Types.ObjectId;
  quantity: number;
  variant?: string;
  price: number;
}

export interface ICart extends Document {
  user?: mongoose.Types.ObjectId;
  sessionId?: string;
  items: ICartItem[];
  updatedAt: Date;
}

const CartSchema = new Schema<ICart>({
  user:      { type: Schema.Types.ObjectId, ref: 'User' },
  sessionId: String,
  items: [{
    product:  { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, min: 1 },
    variant:  String,
    price:    { type: Number, required: true },
  }],
}, { timestamps: true });

CartSchema.index({ user: 1 });
CartSchema.index({ sessionId: 1 });

export default mongoose.model<ICart>('Cart', CartSchema);
