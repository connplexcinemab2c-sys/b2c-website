import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: 'Backend/.env' });

async function createCoupon() {
  await mongoose.connect(process.env.MONGO_URL);
  const db = mongoose.connection.db;

  const couponCode = 'TEST100';

  // Check if it already exists
  const existing = await db.collection('coupons').findOne({
    couponTitle: { $regex: new RegExp(`^${couponCode}$`, 'i') },
    deletedStatus: 0,
  });

  if (existing) {
    console.log('Coupon already exists:', existing);
    process.exit(0);
  }

  // Get last couponId
  const lastCoupon = await db.collection('coupons').findOne(
    { couponId: { $exists: true, $ne: '' } },
    { sort: { _id: -1 } }
  );

  let lastNumber = 0;
  if (lastCoupon && lastCoupon.couponId && lastCoupon.couponId.includes('-')) {
    lastNumber = parseInt(lastCoupon.couponId.split('-')[1], 10) || 0;
  }
  const newCouponId = `CNPX-${String(lastNumber + 1).padStart(7, '0')}`;

  const startDate = new Date('2026-01-01T00:00:00.000Z');
  const endDate = new Date('2027-12-31T23:59:59.999Z');

  const couponDoc = {
    couponFor: ['website', 'app'],
    couponImage: '',
    couponId: newCouponId,
    couponCategory: 'Public',
    couponType: 'Cinema',
    couponUpTo: '100000',
    couponTitle: couponCode,
    couponUsage: 10000,
    couponStartDate: startDate,
    couponEndDate: endDate,
    couponCodeOverAllUsage: 100000,
    couponDescription: '100% discount on movie ticket price for testing',
    movieLanguage: [],
    cityId: [],
    cinemaObjectId: [],
    deletedStatus: 0,
    discountType: '%',
    discount: '100',
    advancedSettings: {
      mergeWithAnotherCoupon: 0,
      autoApplyOnCheckOut: 0,
      privateCoupon: 0,
    },
    assignCoupon: {
      rangeOfSpent: {
        spentForm: 0,
        spentTo: 100000,
      },
      assignUserId: [],
    },
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const result = await db.collection('coupons').insertOne(couponDoc);
  console.log('Successfully created coupon:', {
    _id: result.insertedId,
    ...couponDoc,
  });

  process.exit(0);
}

createCoupon().catch((err) => {
  console.error('Error creating coupon:', err);
  process.exit(1);
});
