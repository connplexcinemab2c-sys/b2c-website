import mongoose from 'mongoose';

async function run() {
  await mongoose.connect('mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin');
  const db = mongoose.connection.db;

  const t1 = await db.collection('transactions').findOne({ initTransId: '20000081303' });
  console.log('Tx 20000081303:');
  console.log('addSeatData:', t1.addSeatData);
  console.log('foodAndBvgResponse:', t1.foodAndBvgResponse);
  console.log('finalBookingCalculation:', t1.finalBookingCalculation);

  const t2 = await db.collection('transactions').findOne({ initTransId: '20000042199' });
  console.log('\nTx 20000042199:');
  console.log('addSeatData:', t2.addSeatData);
  console.log('foodAndBvgResponse:', t2.foodAndBvgResponse);
  console.log('finalBookingCalculation:', t2.finalBookingCalculation);

  await mongoose.disconnect();
}

run();
