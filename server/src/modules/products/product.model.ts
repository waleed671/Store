import mongoose, { Document, Schema } from 'mongoose';

export interface IVariant {
  name: string;     // e.g. "Case Size"
  value: string;    // e.g. "42mm"
  stock: number;
  sku: string;
  price?: number;   // override price
}

export interface IProduct extends Omit<Document, 'collection'> {
  name: string;
  slug: string;
  brand: string;
  sku: string;
  description: string;
  shortDescription: string;
  price: number;
  salePrice?: number;
  images: string[];
  videos?: string[];
  category: mongoose.Types.ObjectId;
  collection?: mongoose.Types.ObjectId;
  tags: string[];
  specs: Record<string, string>;
  variants: IVariant[];
  stock: number;
  trackInventory: boolean;
  isFeatured: boolean;
  isNewArrival: boolean;
  isLimitedEdition: boolean;
  isBestSeller: boolean;
  isActive: boolean;
  ratings: number;
  numReviews: number;
  gender?: 'men' | 'women' | 'unisex';
  movement?: string;
  waterResistance?: string;
  caseMaterial?: string;
  caseDiameter?: string;
  bandMaterial?: string;
  crystalType?: string;
  warranty?: string;
  weight?: number;
  metaTitle?: string;
  metaDescription?: string;
  createdAt: Date;
  updatedAt: Date;
}

const VariantSchema = new Schema<IVariant>({
  name:  { type: String, required: true },
  value: { type: String, required: true },
  stock: { type: Number, default: 0 },
  sku:   { type: String, required: true },
  price: Number,
});

const ProductSchema = new Schema<IProduct>({
  name:             { type: String, required: true, trim: true },
  slug:             { type: String, required: true, unique: true, lowercase: true },
  brand:            { type: String, required: true },
  sku:              { type: String, required: true, unique: true },
  description:      { type: String, required: true },
  shortDescription: String,
  price:            { type: Number, required: true, min: 0 },
  salePrice:        { type: Number, min: 0 },
  images:           [{ type: String }],
  videos:           [String],
  category:         { type: Schema.Types.ObjectId, ref: 'Category', required: true },
  collection:       { type: Schema.Types.ObjectId, ref: 'Collection' },
  tags:             [String],
  specs:            { type: Map, of: String },
  variants:         [VariantSchema],
  stock:            { type: Number, default: 0 },
  trackInventory:   { type: Boolean, default: true },
  isFeatured:       { type: Boolean, default: false },
  isNewArrival:     { type: Boolean, default: false },
  isLimitedEdition: { type: Boolean, default: false },
  isBestSeller:     { type: Boolean, default: false },
  isActive:         { type: Boolean, default: true },
  ratings:          { type: Number, default: 0 },
  numReviews:       { type: Number, default: 0 },
  gender:           { type: String, enum: ['men','women','unisex'] },
  movement:         String,
  waterResistance:  String,
  caseMaterial:     String,
  caseDiameter:     String,
  bandMaterial:     String,
  crystalType:      String,
  warranty:         String,
  weight:           Number,
  metaTitle:        String,
  metaDescription:  String,
}, { timestamps: true });

ProductSchema.index({ name: 'text', brand: 'text', description: 'text', tags: 'text' });
ProductSchema.index({ slug: 1 });
ProductSchema.index({ category: 1 });
ProductSchema.index({ brand: 1 });
ProductSchema.index({ price: 1 });
ProductSchema.index({ ratings: -1 });
ProductSchema.index({ createdAt: -1 });

export default mongoose.model<IProduct>('Product', ProductSchema);
