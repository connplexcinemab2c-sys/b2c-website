import dotenv from 'dotenv';
import mongoose from 'mongoose';
dotenv.config({ path: 'Backend/.env' });

async function run() {
  await mongoose.connect(process.env.MONGO_URL);
  const now = new Date();
  const coupons = await mongoose.connection.db.collection('coupons').find({
    deletedStatus: 0,
    isActive: true,
    couponEndDate: { $gte: now }
  }).limit(5).toArray();
  console.log('ACTIVE COUPONS:', JSON.stringify(coupons.map(c => ({
    title: c.couponTitle,
    category: c.couponCategory,
    type: c.couponType,
    discount: c.discount,
    minAmount: c.minAmount,
    for: c.couponFor,
    endDate: c.couponEndDate
  })), null, 2));

  // Also check some upcoming shows with cinemaId
  const shows = await mongoose.connection.db.collection('shows').find({
    isActive: true,
    deletedStatus: 0,
    showDate: { $gte: now }
  }).limit(3).toArray();
  console.log('SAMPLE UPCOMING SHOWS:', JSON.stringify(shows.map(s => ({
    cinemaId: s.cinemaId,
    sessionId: s.sessionId,
    showDate: s.showDate,
    showTime: s.showTime,
    filmCode: s.filmCode
  })), null, 2));

  process.exit(0);
}
run().catch(console.error);
