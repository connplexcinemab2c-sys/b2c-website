import mongoose from 'mongoose';

async function run() {
  await mongoose.connect('mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin');
  const db = mongoose.connection.db;

  const successTx = await db.collection('transactions').findOne({ initTransId: '20000042203' });
  const failTx1 = await db.collection('transactions').findOne({ initTransId: '20000042199' });
  const failTx2 = await db.collection('transactions').findOne({ initTransId: '20000002924' });

  console.log('=== SUCCESS TX: 20000042203 ===');
  console.log('createdAt:', successTx.createdAt);
  console.log('cinemaId:', successTx.cinemaId);
  console.log('paymentResponse.amount:', successTx.paymentResponse?.amount);
  console.log('finalBookingCalculation:', JSON.stringify(successTx.finalBookingCalculation, null, 2));
  console.log('setSeatData:', successTx.setSeatData);
  console.log('commitBookingData:', successTx.commitBookingData);

  console.log('\n=== FAIL TX 1: 20000042199 ===');
  console.log('createdAt:', failTx1.createdAt);
  console.log('cinemaId:', failTx1.cinemaId);
  console.log('paymentResponse.amount:', failTx1.paymentResponse?.amount);
  console.log('finalBookingCalculation:', JSON.stringify(failTx1.finalBookingCalculation, null, 2));
  console.log('setSeatData:', failTx1.setSeatData);
  console.log('vistaErrorResponse:', failTx1.vistaErrorResponse);

  console.log('\n=== FAIL TX 2 (SHEIKHPURA): 20000002924 ===');
  console.log('createdAt:', failTx2.createdAt);
  console.log('cinemaId:', failTx2.cinemaId);
  console.log('paymentResponse.amount:', failTx2.paymentResponse?.amount);
  console.log('finalBookingCalculation:', JSON.stringify(failTx2.finalBookingCalculation, null, 2));
  console.log('setSeatData:', failTx2.setSeatData);
  console.log('vistaErrorResponse:', failTx2.vistaErrorResponse);

  await mongoose.disconnect();
}

run().catch(console.error);
