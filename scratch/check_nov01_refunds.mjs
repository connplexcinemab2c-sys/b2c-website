import mongoose from 'mongoose';

async function run() {
  await mongoose.connect('mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin');
  const db = mongoose.connection.db;

  const start = new Date('2026-11-01T00:00:00.000+05:30');
  const end = new Date('2026-11-01T23:59:59.999+05:30');

  const status4Txs = await db.collection('transactions').find({
    status: 4,
    createdAt: { $gte: start, $lte: end }
  }).toArray();

  console.log(`Status 4 count: ${status4Txs.length}`);

  for (const tx of status4Txs) {
    console.log({
      id: tx._id,
      initTransId: tx.initTransId,
      refundResponse: tx.refundResponse,
      refundStatus: tx.refundStatus,
      rzpPaymentId: tx.paymentResponse?.razorpay_payment_id || tx.paymentResponse?.id,
      amount: tx.paymentResponse?.amount,
      logs: tx.logs
    });
  }

  await mongoose.disconnect();
}

run();
