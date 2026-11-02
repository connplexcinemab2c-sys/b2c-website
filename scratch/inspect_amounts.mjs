import mongoose from 'mongoose';

async function run() {
  await mongoose.connect('mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin');
  const db = mongoose.connection.db;

  const sample4 = await db.collection('transactions').findOne({
    status: 4,
    createdAt: { $gte: new Date('2026-11-01T00:00:00.000+05:30') }
  });

  console.log('sample4 setSeatData.curTotal:', sample4?.setSeatData?.curTotal);
  console.log('sample4 finalBookingCalculation:', sample4?.finalBookingCalculation);

  await mongoose.disconnect();
}

run();
