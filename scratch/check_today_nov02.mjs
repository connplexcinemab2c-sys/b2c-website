import mongoose from 'mongoose';

async function run() {
  await mongoose.connect('mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin');
  const db = mongoose.connection.db;

  const start = new Date('2026-11-02T00:00:00.000+05:30');
  const now = new Date();

  const todayTxs = await db.collection('transactions').find({
    status: { $ne: 0 },
    createdAt: { $gte: start, $lte: now }
  }).toArray();

  console.log(`Today (02/11/2026) so far: ${todayTxs.length} bookings attempted`);
  const statusCounts = {};
  for (const t of todayTxs) statusCounts[t.status] = (statusCounts[t.status] || 0) + 1;
  console.log('Status counts today:', statusCounts);

  const status4Today = todayTxs.filter(t => t.status === 4);
  console.log(`Status 4 count today: ${status4Today.length}`);
  if (status4Today.length > 0) {
    for (const t of status4Today) {
      console.log(`  - Tx: ${t.initTransId}, amount: ₹${t.finalAmount || t.paymentResponse?.amount}, rzp: ${t.paymentResponse?.razorpay_payment_id}`);
    }
  }

  await mongoose.disconnect();
}

run();
