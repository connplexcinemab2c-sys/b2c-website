import mongoose from 'mongoose';

async function run() {
  await mongoose.connect('mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin');
  const db = mongoose.connection.db;

  const t = await db.collection('transactions').findOne({ initTransId: '20000128854' });
  console.log('Tx 20000128854:');
  console.log('finalBookingCalculation:', JSON.stringify(t.finalBookingCalculation, null, 2));
  console.log('addSeatData:', t.addSeatData);
  console.log('commitBookingData:', t.commitBookingData);
  console.log('paymentResponse:', t.paymentResponse);

  await mongoose.disconnect();
}

run().catch(console.error);
