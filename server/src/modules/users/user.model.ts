import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IAddress {
  _id?: mongoose.Types.ObjectId;
  label: string;
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault: boolean;
}

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  phone?: string;
  avatar?: string;
  role: 'customer' | 'admin' | 'manager' | 'staff';
  googleId?: string;
  isVerified: boolean;
  isBlocked: boolean;
  addresses: IAddress[];
  wishlist: mongoose.Types.ObjectId[];
  refreshToken?: string;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  loyaltyPoints: number;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(password: string): Promise<boolean>;
}

const AddressSchema = new Schema<IAddress>({
  label:     { type: String, default: 'Home' },
  fullName:  { type: String, required: true },
  phone:     { type: String, required: true },
  line1:     { type: String, required: true },
  line2:     String,
  city:      { type: String, required: true },
  state:     { type: String, required: true },
  pincode:   { type: String, required: true },
  country:   { type: String, default: 'India' },
  isDefault: { type: Boolean, default: false },
});

const UserSchema = new Schema<IUser>({
  name:          { type: String, required: true, trim: true },
  email:         { type: String, required: true, unique: true, lowercase: true },
  password:      { type: String, select: false },
  phone:         String,
  avatar:        String,
  role:          { type: String, enum: ['customer','admin','manager','staff'], default: 'customer' },
  googleId:      String,
  isVerified:    { type: Boolean, default: false },
  isBlocked:     { type: Boolean, default: false },
  addresses:     [AddressSchema],
  wishlist:      [{ type: Schema.Types.ObjectId, ref: 'Product' }],
  refreshToken:  String,
  passwordResetToken:   String,
  passwordResetExpires: Date,
  loyaltyPoints: { type: Number, default: 0 },
}, { timestamps: true });

UserSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

UserSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
  return bcrypt.compare(password, this.password);
};

UserSchema.index({ email: 1 });
UserSchema.index({ googleId: 1 });

export default mongoose.model<IUser>('User', UserSchema);
