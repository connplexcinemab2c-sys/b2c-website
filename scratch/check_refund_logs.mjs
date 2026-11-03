import mongoose from 'mongoose';

async function run() {
  await mongoose.connect('mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin');
  const db = mongoose.connection.db;

  const refundLogs = await db.collection('universallogs').find({
    $or: [
      { 'step.logType': 'refundResponse' },
      { 'step.message': /refund/i }
    ],
    createdAt: { $gte: new Date('2026-11-01T00:00:00.000Z') }
  }).toArray();

  console.log(`Refund logs count since Nov 01: ${refundLogs.length}`);
  for (const l of refundLogs) {
    console.log(l.createdAt, l.transaction_id, l.step?.message, l.step?.error);
  }

  // Check any transaction with refundStatus: true since Nov 01
  const refundedTxs = await db.collection('transactions').find({
    refundStatus: true,
    createdAt: { $gte: new Date('2026-11-01T00:00:00.000Z') }
  }).toArray();
  console.log(`Refunded transactions count since Nov 01: ${refundedTxs.length}`);

  await mongoose.disconnect();
}

run();
