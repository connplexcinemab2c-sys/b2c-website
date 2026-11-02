import mongoose from 'mongoose';

async function run() {
  await mongoose.connect('mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin');
  const db = mongoose.connection.db;

  const start = new Date('2026-10-25T00:00:00.000+05:30');
  const now = new Date('2026-10-31T23:59:59.999+05:30');

  console.log("=== Checking transactions with amount_refunded > 0 ===");
  const txRefunded = await db.collection('transactions').find({
    $or: [
      { "paymentResponse.amount_refunded": { $gt: 0 } },
      { "paymentResponse.refund_status": { $ne: null } }
    ]
  }).toArray();
  console.log(`Found ${txRefunded.length} in transactions`);
  for (const t of txRefunded) {
    console.log({
      id: t._id,
      transId: t.transId || t.initTransId,
      createdAt: t.createdAt,
      amount: t.finalAmount,
      amount_refunded: t.paymentResponse?.amount_refunded,
      refund_status: t.paymentResponse?.refund_status
    });
  }

  console.log("=== Checking subscriptiontransactions with amount_refunded > 0 ===");
  const subRefunded = await db.collection('subscriptiontransactions').find({
    $or: [
      { "paymentResponse.amount_refunded": { $gt: 0 } },
      { "paymentResponse.refund_status": { $ne: null } }
    ]
  }).toArray();
  console.log(`Found ${subRefunded.length} in subscriptiontransactions`);
  for (const s of subRefunded) {
    console.log({
      id: s._id,
      initTransId: s.initTransId,
      createdAt: s.createdAt,
      amount_refunded: s.paymentResponse?.amount_refunded
    });
  }

  // Also check Ecommerce orders/transactions
  console.log("=== Checking ecommerce orders / transactions ===");
  const ecomCols = ['orders', 'ecommerceorders', 'ecom_orders'];
  for (const ec of ecomCols) {
    const exists = await db.collection(ec).countDocuments();
    if (exists > 0) {
      console.log(`Collection ${ec} has ${exists} documents`);
    }
  }

  await mongoose.disconnect();
}

run();
