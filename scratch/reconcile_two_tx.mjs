import mongoose from 'mongoose';

async function run() {
  await mongoose.connect('mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin');
  const db = mongoose.connection.db;

  // 1. Fix 20000220165
  await db.collection('transactions').updateOne(
    { initTransId: '20000220165' },
    {
      $set: {
        status: 1,
        paymentsStatus: true,
        commitStatus: true,
        reconciled: true,
        reconciledReason: "Restored status 1: already had full commitBookingData with ticket WWH5CBW"
      }
    }
  );

  // 2. Fix 20000216511
  await db.collection('transactions').updateOne(
    { initTransId: '20000216511' },
    {
      $set: {
        status: 1,
        paymentsStatus: true,
        commitStatus: true,
        commitBookingData: {
          strBookId: 'WGMD2RW',
          intBookId: 176668,
          curTotal: 1000,
          curTicketsTotal: 1000,
          strException: ''
        },
        reconciled: true,
        reconciledReason: "Restored status 1: ticket WGMD2RW booked at 08:55:08Z prior to duplicate callback overwrite"
      }
    }
  );

  console.log("Successfully reconciled transactions 20000220165 and 20000216511 to Status 1.");
  await mongoose.disconnect();
}

run();
