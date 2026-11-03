const mongoose = require('../Backend/node_modules/mongoose');

async function check() {
  await mongoose.connect('mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin');
  const txs = await mongoose.connection.collection('transactions').find({
    createdAt: { $gte: new Date('2026-11-03T13:40:00+05:30') }
  }).sort({ createdAt: -1 }).toArray();

  console.log('Total transactions since 1:40 PM deployment:', txs.length);
  const s1 = txs.filter(t => t.status === 1 || t.commitStatus === true);
  const s4 = txs.filter(t => t.status === 4);
  console.log(`- Status 1 (Success): ${s1.length}`);
  console.log(`- Status 4 (Failure): ${s4.length}`);

  for (const t of s1) {
    const time = new Date(t.createdAt).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' });
    console.log(`  [CONFIRMED] Time: ${time}, transId: ${t.initTransId}, amount: ₹${t.finalPrice}`);
  }

  for (const t of s4) {
    const time = new Date(t.createdAt).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' });
    console.log(`  [FAILED S4] Time: ${time}, transId: ${t.initTransId}, amount: ₹${t.finalPrice}`);
  }

  await mongoose.disconnect();
}
check();
