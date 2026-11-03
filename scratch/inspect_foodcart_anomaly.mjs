import mongoose from 'mongoose';

async function run() {
  await mongoose.connect('mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin');
  const db = mongoose.connection.db;

  const t = await db.collection('transactions').findOne({ initTransId: '20000042524' });
  console.log('foodCart for 20000042524:');
  console.log(JSON.stringify(t.finalBookingCalculation?.foodCart, null, 2));
  console.log('foodAndBvgResponse:', t.foodAndBvgResponse);
  console.log('addSeatData:', t.addSeatData);

  await mongoose.disconnect();
}

run();
