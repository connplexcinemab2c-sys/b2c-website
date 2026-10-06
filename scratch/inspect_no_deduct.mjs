import mongoose from 'mongoose';

async function run() {
  await mongoose.connect('mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin');
  const db = mongoose.connection.db;

  // Let's find all transactions where ticket was booked in Vista, but payment might not have been deducted
  // Scenario 1: commitStatus = true AND paymentsStatus != true
  const q1 = await db.collection('transactions').find({
    deletedStatus: 0,
    commitStatus: true,
    paymentsStatus: { $ne: true }
  }).sort({ createdAt: -1 }).toArray();

  console.log(`Scenario 1: commitStatus=true but paymentsStatus!=true: ${q1.length}`);
  for (const t of q1.slice(0, 5)) {
    console.log(`TransId: ${t.transId || t.initTransId} | Status: ${t.status} | PayStatus: ${t.paymentsStatus} | PayRespStatus: ${t.paymentResponse?.order_status || t.paymentResponse?.status} | Amount: ${t.paymentResponse?.amount} | Date: ${t.createdAt}`);
  }

  // Scenario 2: commitStatus = true AND payment was refunded (refundStatus = true or refundResponse != null)
  const q2 = await db.collection('transactions').find({
    deletedStatus: 0,
    commitStatus: true,
    $or: [{ refundStatus: true }, { refundResponse: { $ne: null } }]
  }).sort({ createdAt: -1 }).toArray();

  console.log(`\nScenario 2: commitStatus=true but refunded: ${q2.length}`);
  for (const t of q2.slice(0, 5)) {
    console.log(`TransId: ${t.transId || t.initTransId} | Status: ${t.status} | RefundStatus: ${t.refundStatus} | Date: ${t.createdAt}`);
  }

  // Scenario 3: Check transactions where ticket was booked (commitBookingData.strBookId exists)
  // but razorpay_payment_id is missing or order_status != 'Success'
  const q3 = await db.collection('transactions').find({
    deletedStatus: 0,
    'commitBookingData.strBookId': { $exists: true, $ne: '' },
    $or: [
      { 'paymentResponse.razorpay_payment_id': { $exists: false } },
      { 'paymentResponse.razorpay_payment_id': null },
      { 'paymentResponse.order_status': { $nin: ['Success', 'captured'] } }
    ]
  }).sort({ createdAt: -1 }).toArray();

  console.log(`\nScenario 3: Booked in Vista but no valid Razorpay payment: ${q3.length}`);
  for (const t of q3.slice(0, 10)) {
    console.log(`TransId: ${t.transId || t.initTransId} | PaymentFrom: ${t.paymentFrom} | PayResp:`, t.paymentResponse);
  }

  await mongoose.disconnect();
}

run();
