import mongoose from 'mongoose';

async function run() {
  await mongoose.connect('mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin');
  const db = mongoose.connection.db;

  console.log("--- 1. Transactions with status: 1 but amount = 0 or missing payment info ---");
  const freeOrZero = await db.collection('transactions').find({
    deletedStatus: 0,
    commitStatus: true,
    $or: [
      { 'finalBookingCalculation.finalAmount': 0 },
      { 'finalBookingCalculation.finalAmount': { $lte: 0 } },
      { 'paymentResponse.amount': 0 },
      { 'paymentResponse.amount': { $lte: 0 } },
      { paymentResponse: null },
      { paymentsStatus: false }
    ]
  }).toArray();

  console.log(`Found ${freeOrZero.length} transactions:`);
  for (const t of freeOrZero) {
    console.log({
      id: t._id,
      date: t.createdAt,
      transId: t.transId || t.initTransId,
      status: t.status,
      paymentsStatus: t.paymentsStatus,
      amount: t.finalBookingCalculation?.finalAmount,
      payRespAmount: t.paymentResponse?.amount,
      payment_id: t.paymentResponse?.razorpay_payment_id || t.paymentResponse?.id,
      order_status: t.paymentResponse?.order_status,
      captured: t.paymentResponse?.captured
    });
  }

  console.log("\n--- 2. Transactions where status: 1 but Razorpay captured is not true ---");
  const notCaptured = await db.collection('transactions').find({
    deletedStatus: 0,
    status: 1,
    commitStatus: true,
    $or: [
      { 'paymentResponse.captured': false },
      { 'paymentResponse.order_status': { $ne: 'Success' } }
    ]
  }).toArray();
  console.log(`Found ${notCaptured.length} transactions where status=1 but not captured/Success:`);
  for (const t of notCaptured) {
    console.log({
      id: t._id,
      transId: t.transId || t.initTransId,
      captured: t.paymentResponse?.captured,
      order_status: t.paymentResponse?.order_status,
      paymentResponse: t.paymentResponse
    });
  }

  await mongoose.disconnect();
}

run();
