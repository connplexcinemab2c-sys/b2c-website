import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: 'Backend/.env' });

async function verify() {
  await mongoose.connect(process.env.MONGO_URL);
  const coupon = await mongoose.connection.db.collection('coupons').findOne({ couponTitle: 'TEST100' });
  console.log('TEST100 Coupon in DB:', JSON.stringify(coupon, null, 2));
  process.exit(0);
}
verify().catch(e => { console.error(e); process.exit(1); });
