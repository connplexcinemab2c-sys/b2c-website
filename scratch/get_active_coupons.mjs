import dotenv from 'dotenv';
import mongoose from 'mongoose';
dotenv.config({ path: 'Backend/.env' });

async function getCoupons() {
  await mongoose.connect(process.env.MONGO_URL);
  const now = new Date();
  const coupons = await mongoose.connection.db.collection('coupons')
    .find({ deletedStatus: 0, isActive: true, couponEndDate: { $gte: now } })
    .limit(10)
    .toArray();
  
  console.log("AVAILABLE TEST COUPONS:", JSON.stringify(coupons.map(c => ({
    couponTitle: c.couponTitle,
    couponType: c.couponType,
    couponCategory: c.couponCategory,
    discount: c.discount,
    minAmount: c.minAmount,
    couponFor: c.couponFor
  })), null, 2));

  process.exit(0);
}
getCoupons().catch(console.error);
