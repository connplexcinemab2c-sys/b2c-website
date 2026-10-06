import mongoose from 'mongoose';

async function run() {
  await mongoose.connect('mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin');
  const db = mongoose.connection.db;

  const result = await db.collection('transactions').updateMany(
    {
      deletedStatus: 0,
      commitStatus: true,
      'commitBookingData.strBookId': { $exists: true, $ne: '' },
      'paymentResponse.captured': true,
      status: 5
    },
    {
      $set: {
        status: 1,
        paymentsStatus: true,
        reconciled: true,
        reconciledReason: "Restored status 1: payment was captured and Vista ticket was successfully committed prior to late frontend cancellation event"
      }
    }
  );

  console.log(`Reconciled ${result.modifiedCount} transactions from status 5 -> status 1.`);
  await mongoose.disconnect();
}

run();
