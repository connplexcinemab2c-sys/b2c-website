import mongoose from 'mongoose';

async function run() {
  await mongoose.connect('mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin');
  const db = mongoose.connection.db;

  const records = await db.collection('transactions').find({
    deletedStatus: 0,
    commitStatus: true,
    'paymentResponse.captured': true,
    status: 5
  }).toArray();

  console.log(`Found ${records.length} records where payment was captured AND ticket was committed, but status was overwritten to 5:`);
  for (const r of records) {
    console.log(`- TransID: ${r.transId || r.initTransId} | RazorpayID: ${r.paymentResponse?.id || r.paymentResponse?.razorpay_payment_id} | Amount: ₹${r.paymentResponse?.amount} | VistaBookId: ${r.commitBookingData?.strBookId}`);
  }

  await mongoose.disconnect();
}

run();
