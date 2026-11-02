import mongoose from 'mongoose';

async function run() {
  await mongoose.connect('mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin');
  const db = mongoose.connection.db;

  const txIds = ['20000002890', '20000252474', '20000048149', '20000042191', '20000042199', '20000042203'];

  for (const tid of txIds) {
    const t = await db.collection('transactions').findOne({ initTransId: tid });
    if (!t) {
      console.log(`Tx ${tid}: NOT FOUND`);
      continue;
    }
    console.log(`\nTx ${tid}: status = ${t.status}, cinemaId = ${t.cinemaId}`);
    console.log('addSeatData:', {
      intException: t.addSeatData?.intException,
      strException: t.addSeatData?.strException,
      strSeatInfo: t.addSeatData?.strSeatInfo,
      curTicketsTotal: t.addSeatData?.curTicketsTotal
    });
    console.log('vistaErrorResponse:', t.vistaErrorResponse);
    console.log('commitBookingData:', t.commitBookingData ? {
      intException: t.commitBookingData.intException,
      strSeatInfo: t.commitBookingData.strSeatInfo,
      strTransId: t.commitBookingData.strTransId
    } : null);
    console.log('settlementMode:', t.settlementMode, 'notes:', t.settlementNotes);
  }

  await mongoose.disconnect();
}

run().catch(console.error);
