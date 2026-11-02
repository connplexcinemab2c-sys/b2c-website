import mongoose from 'mongoose';

async function run() {
  await mongoose.connect('mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin');
  const db = mongoose.connection.db;

  const start = new Date('2026-11-01T00:00:00.000+05:30');
  const end = new Date('2026-11-01T23:59:59.999+05:30');

  const s2Txs = await db.collection('transactions').find({
    status: 2,
    createdAt: { $gte: start, $lte: end }
  }).toArray();

  console.log(`Status 2 total: ${s2Txs.length}`);

  const breakdown = {};
  for (const t of s2Txs) {
    const rzpErr = t.paymentResponse?.error;
    const desc = rzpErr?.description || rzpErr?.reason || t.error || (t.logs?.find(l => l.userCancelled) ? 'User Cancelled on Checkout' : 'Abandoned / Payment Failed');
    breakdown[desc] = (breakdown[desc] || 0) + 1;
  }
  console.log('Status 2 descriptions:');
  console.table(breakdown);

  // Check how many had userCancelled in logs
  let userCancelledCount = 0;
  for (const t of s2Txs) {
    if (t.logs && t.logs.some(l => l.userCancelled)) {
      userCancelledCount++;
    }
  }
  console.log(`Transactions with userCancelled log: ${userCancelledCount} / ${s2Txs.length}`);

  await mongoose.disconnect();
}

run();
