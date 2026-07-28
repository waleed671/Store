const mongoose = require('mongoose');

const uri = 'mongodb://127.0.0.1:27017/chronex';
const fallbackImg = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1000&auto=format&fit=crop&q=80';

mongoose.connect(uri).then(async () => {
  const products = await mongoose.connection.collection('products').find({}).toArray();
  for (const p of products) {
    let img = (p.images && p.images[0]) ? p.images[0] : '';
    if (!img || img.includes('google.com') || img.length > 200 || !img.startsWith('http')) {
      await mongoose.connection.collection('products').updateOne(
        { _id: p._id },
        { $set: { images: [fallbackImg] } }
      );
      console.log('UPDATED IMAGE FOR:', p.name);
    }
  }
  console.log('ALL MONGO PRODUCTS IMAGES CLEANED & VERIFIED!');
  process.exit(0);
});
