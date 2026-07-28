import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './modules/users/user.model';
import Product from './modules/products/product.model';
import Category from './modules/categories/category.model';
import Coupon from './modules/coupons/coupon.model';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/chronex';

async function seedDatabase() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing collections
    await User.deleteMany({});
    await Product.deleteMany({});
    await Category.deleteMany({});
    await Coupon.deleteMany({});

    // 1. Create Admin User
    const adminUser = await User.create({
      name: 'Chronex Master Admin',
      email: 'admin@chronex.com',
      password: 'Admin123456Password!',
      role: 'admin',
    });
    console.log('Created Admin User: admin@chronex.com');

    // 2. Create Categories
    const lunarixCat = await Category.create({
      name: 'Lunarix Series',
      slug: 'lunarix-series',
      description: 'Deep Space Titanium Tourbillons & Mechanical Masterpieces',
      isFeatured: true,
    });

    const tourbillonCat = await Category.create({
      name: 'Flying Tourbillons',
      slug: 'flying-tourbillons',
      description: 'High-complication mechanical gravity-defying tourbillons',
      isFeatured: true,
    });

    const goldCat = await Category.create({
      name: 'Solar Gold Edition',
      slug: 'solar-gold-edition',
      description: '18K Celestial Gold & Sapphire Horology',
      isFeatured: true,
    });

    const diverCat = await Category.create({
      name: 'Obsidian Deep Diver',
      slug: 'obsidian-deep-diver',
      description: '300M Waterproof Extreme Deep Sea Horology',
      isFeatured: true,
    });

    // 3. Create Sample Products
    const products = [
      {
        name: 'CHRONEX Lunarix One - Deep Space Edition',
        brand: 'CHRONEX',
        slug: 'lunarix-one-deep-space',
        sku: 'CHX-LUNARIX-01',
        description: 'Engineered from Grade 5 Titanium alloy, the CHRONEX Lunarix One features a manufacture L-9001 automatic flying tourbillon movement with double-curved anti-reflective sapphire crystal.',
        price: 2499,
        salePrice: 1999,
        category: lunarixCat._id,
        stock: 15,
        images: [
          'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1000&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=1000&auto=format&fit=crop&q=80',
        ],
        specifications: {
          'Movement': 'Manufacture L-9001 Automatic Tourbillon',
          'Power Reserve': '72 Hours',
          'Case Material': 'Grade 5 Titanium',
          'Water Resistance': '300 Meters',
        },
        ratings: 5.0,
        numReviews: 48,
        isFeatured: true,
        isNewArrival: true,
      },
      {
        name: 'CHRONEX L-9001 Titanium Flying Tourbillon',
        brand: 'CHRONEX',
        slug: 'chronex-titanium-flying-tourbillon',
        sku: 'CHX-TOURB-02',
        description: 'Single-axis flying tourbillon with openworked titanium bridge architecture and luminous hour indexes.',
        price: 3200,
        salePrice: 2850,
        category: tourbillonCat._id,
        stock: 8,
        images: [
          'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=1000&auto=format&fit=crop&q=80',
        ],
        ratings: 4.9,
        numReviews: 32,
        isFeatured: true,
      },
      {
        name: 'CHRONEX Solar Gold Chronograph',
        brand: 'CHRONEX',
        slug: 'chronex-solar-gold-chronograph',
        sku: 'CHX-GOLD-03',
        description: '18K Gold electroplated casing with sapphire crystal case back displaying the column-wheel chronograph movement.',
        price: 1850,
        category: goldCat._id,
        stock: 20,
        images: [
          'https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=1000&auto=format&fit=crop&q=80',
        ],
        ratings: 4.8,
        numReviews: 64,
        isNewArrival: true,
      },
      {
        name: 'CHRONEX Obsidian Deep Diver 300M',
        brand: 'CHRONEX',
        slug: 'chronex-obsidian-deep-diver-300m',
        sku: 'CHX-DIVER-04',
        description: 'Helium escape valve, ceramic unidirectionally rotating bezel, and Super-LumiNova BGW9 markers for zero-visibility underwater dive missions.',
        price: 1450,
        salePrice: 1290,
        category: diverCat._id,
        stock: 25,
        images: [
          'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1000&auto=format&fit=crop&q=80',
        ],
        ratings: 5.0,
        numReviews: 91,
        isFeatured: true,
      },
    ];

    await Product.insertMany(products);
    console.log('Seeded Products Successfully!');

    // 4. Create Sample Coupon
    await Coupon.create({
      code: 'LUNARIX10',
      discount: 10,
      discountType: 'percentage',
      minOrderValue: 500,
      expiresAt: new Date('2028-12-31'),
      description: '10% OFF for Horology Club Members',
    });
    console.log('Created Coupon: LUNARIX10');

    console.log('Database Seeding Complete!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
}

seedDatabase();
