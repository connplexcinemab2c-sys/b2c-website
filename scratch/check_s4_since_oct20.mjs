import mongoose from 'mongoose';

async function run() {
  await mongoose.connect('mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin');
  const db = mongoose.connection.db;

  const start = new Date('2026-10-20T00:00:00.000+05:30');
  const end = new Date('2026-10-31T23:59:59.999+05:30');

  const s4Txs = await db.collection('transactions').find({
    deletedStatus: 0,
    status: 4,
    createdAt: { $gte: start, $lte: end }
  }).sort({ createdAt: 1 }).toArray();

  console.log(`Total Status 4 (Paid but commit failed) since Oct 20: ${s4Txs.length}`);

  const byDate = {};
  for (const t of s4Txs) {
    const d = new Date(t.createdAt).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' });
    if (!byDate[d]) byDate[d] = [];
    byDate[d].push(t);
  }

  for (const [d, list] of Object.entries(byDate)) {
    console.log(`\nDate: ${d} -> ${list.length} Status 4 transactions:`);
    for (const t of list) {
      console.log(`  Trans: ${t.initTransId || t.transId} | Razorpay: ${t.paymentResponse?.id || t.paymentResponse?.razorpay_payment_id} | Amount: ₹${t.finalAmount || (t.paymentResponse?.amount / 100)} | Phone: ${t.normalized_phone || t.paymentResponse?.contact} | Cinema: ${t.cinemaId}`);
    }
  }

  await mongoose.disconnect();
}

run();
