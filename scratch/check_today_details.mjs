import mongoose from 'mongoose';

async function run() {
  await mongoose.connect('mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin');
  const db = mongoose.connection.db;
  const txs = await db.collection('transactions').find({
    status: 4,
    createdAt: { $gte: new Date('2026-11-02T00:00:00.000+05:30') }
  }).toArray();
  for (const t of txs) {
    console.log(t.initTransId, 'curFoodTotal:', t.addSeatData?.curFoodTotal, 'seats:', t.setSeatData?.strSeatInfo, 'amount:', t.finalBookingCalculation?.finalAmount);
  }
  await mongoose.disconnect();
}
run();
