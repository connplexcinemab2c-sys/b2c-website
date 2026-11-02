import mongoose from 'mongoose';

async function run() {
  await mongoose.connect('mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin');
  const db = mongoose.connection.db;

  const recentTxs = await db.collection('transactions').find({
    createdAt: { $gte: new Date(Date.now() - 3600000) }
  }).sort({ createdAt: -1 }).toArray();

  console.log(`Recent transactions in last 1 hour: ${recentTxs.length}`);
  for (const t of recentTxs) {
    console.log(`TX: ${t.initTransId} | Status: ${t.status} | Amt: ₹${t.paymentResponse?.amount || t.finalAmount} | Disc: ${t.finalBookingCalculation?.ticketCart?.discountAmount} | Cinema: ${t.cinemaId} | Err: ${t.vistaErrorResponse ? t.vistaErrorResponse.msg : 'none'}`);
  }

  await mongoose.disconnect();
}

run().catch(console.error);
