import mongoose from 'mongoose';

async function run() {
  await mongoose.connect('mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin');
  const db = mongoose.connection.db;

  const sample = await db.collection('transactions').findOne({ status: 1 });
  console.log('Sample status 1 transaction keys:', Object.keys(sample || {}));
  console.log('commitBookingData:', JSON.stringify(sample?.commitBookingData, null, 2));
  console.log('initTransId:', sample?.initTransId);
  console.log('paymentDetail:', JSON.stringify(sample?.paymentDetail, null, 2));

  await mongoose.disconnect();
}

run();
