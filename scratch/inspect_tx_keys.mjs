import mongoose from 'mongoose';

async function run() {
  await mongoose.connect('mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin');
  const db = mongoose.connection.db;

  const sample4 = await db.collection('transactions').findOne({
    status: 4,
    createdAt: { $gte: new Date('2026-11-01T00:00:00.000+05:30') }
  });

  const sample1 = await db.collection('transactions').findOne({
    status: 1,
    createdAt: { $gte: new Date('2026-11-01T00:00:00.000+05:30') }
  });

  console.log('Sample Status 4 keys:', Object.keys(sample4 || {}));
  console.log('Sample Status 4 paymentResponse:', JSON.stringify(sample4?.paymentResponse, null, 2));
  console.log('Sample Status 4 amounts:', {
    totalAmount: sample4?.totalAmount,
    amount: sample4?.amount,
    finalAmount: sample4?.finalAmount,
    total: sample4?.total,
    paidAmount: sample4?.paidAmount,
    setSeatData: sample4?.setSeatData ? Object.keys(sample4.setSeatData) : null,
    bookingData: sample4?.bookingData ? Object.keys(sample4.bookingData) : null
  });

  console.log('\nSample Status 1 amounts:', {
    totalAmount: sample1?.totalAmount,
    amount: sample1?.amount,
    finalAmount: sample1?.finalAmount,
    setSeatData: sample1?.setSeatData ? Object.keys(sample1.setSeatData) : null
  });

  // Check how `udsCommitBook` is called in the Backend code
  await mongoose.disconnect();
}

run();
