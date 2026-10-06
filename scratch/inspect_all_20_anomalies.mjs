import mongoose from 'mongoose';

async function run() {
  await mongoose.connect('mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin');
  const db = mongoose.connection.db;

  const q1 = await db.collection('transactions').find({
    deletedStatus: 0,
    commitStatus: true,
    paymentsStatus: { $ne: true }
  }).sort({ createdAt: -1 }).toArray();

  console.log(`Found ${q1.length} transactions where commitStatus=true but paymentsStatus!=true:`);
  for (const t of q1) {
    const timeIST = new Date(t.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    console.log(`-----------------------------------------------`);
    console.log(`ID: ${t._id} | TransID: ${t.transId || t.initTransId} | Date: ${timeIST}`);
    console.log(`Status: ${t.status} | paymentsStatus: ${t.paymentsStatus} | paymentFrom: ${t.paymentFrom}`);
    console.log(`PaymentResponse OrderStatus: ${t.paymentResponse?.order_status} | Captured: ${t.paymentResponse?.captured}`);
    console.log(`Amount in cart: ${t.finalBookingCalculation?.finalAmount} | Amount in payResp: ${t.paymentResponse?.amount}`);
    console.log(`BookId: ${t.commitBookingData?.strBookId}`);
    console.log(`Logs:`, t.logs);
  }

  await mongoose.disconnect();
}

run();
