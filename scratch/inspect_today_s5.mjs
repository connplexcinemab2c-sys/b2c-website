import mongoose from 'mongoose';

async function run() {
  await mongoose.connect('mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin');
  const db = mongoose.connection.db;

  const start = new Date('2026-10-07T00:00:00.000+05:30');
  const s5List = await db.collection('transactions').find({
    deletedStatus: 0,
    status: 5,
    createdAt: { $gte: start }
  }).toArray();

  console.log(`--- STATUS 5 BREAKDOWN (TOTAL: ${s5List.length}) ---`);
  for (const s of s5List) {
    const timeIST = new Date(s.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    console.log(`[${timeIST}] TransID: ${s.transId || s.initTransId} | OrderStatus: ${s.paymentResponse?.order_status} | CronRecovered: ${s.paymentResponse?.cron_recovered} | Contact: ${s.paymentResponse?.contact || s.normalized_phone || 'N/A'} | Error:`, s.paymentResponse?.error || s.paymentResponse?.error_description || 'User closed modal / timeout');
  }

  await mongoose.disconnect();
}

run();
