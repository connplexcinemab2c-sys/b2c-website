import mongoose from 'mongoose';

async function run() {
  try {
    await mongoose.connect('mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin');
    const db = mongoose.connection.db;

    console.log("=== ISSUE 1: TICKET BOOKED BUT AMOUNT NOT DEDUCTED ===");
    // Find tickets where commitStatus is true, but:
    // a) paymentsStatus is false or undefined
    // b) paymentResponse is missing or paymentResponse.order_status !== 'Success'
    // c) razorpay_payment_id is missing or null
    const bookedNoPayment = await db.collection('transactions').find({
      deletedStatus: 0,
      commitStatus: true,
      $or: [
        { paymentsStatus: false },
        { paymentsStatus: { $exists: false } },
        { paymentResponse: null },
        { 'paymentResponse.order_status': { $ne: 'Success' } },
        { 'paymentResponse.razorpay_payment_id': { $exists: false } },
        { 'paymentResponse.razorpay_payment_id': null }
      ]
    }).sort({ createdAt: -1 }).limit(20).toArray();

    console.log(`Found ${bookedNoPayment.length} records where commitStatus=true but payment issue:`);
    for (const tx of bookedNoPayment) {
      console.log({
        id: tx._id,
        createdAt: tx.createdAt,
        transId: tx.transId || tx.initTransId,
        status: tx.status,
        paymentsStatus: tx.paymentsStatus,
        paymentResponse: tx.paymentResponse,
        finalAmount: tx.finalBookingCalculation?.finalAmount,
        booking_type: tx.booking_type,
        commitBookingData: tx.commitBookingData ? 'Exists' : 'None',
        strBookId: tx.commitBookingData?.strBookId || tx.addSeatData?.strBookId
      });
    }

    console.log("\n=== ISSUE 2: AMOUNT DEDUCTED BUT TICKET NOT BOOKED ===");
    // Find tickets where payment was successful (paymentsStatus=true or paymentResponse.order_status='Success')
    // but commitStatus is false or commitBookingData is missing
    const paidNoTicket = await db.collection('transactions').find({
      deletedStatus: 0,
      paymentsStatus: true,
      $or: [
        { commitStatus: false },
        { commitStatus: { $exists: false } },
        { commitBookingData: null },
        { 'commitBookingData.strBookId': { $exists: false } },
        { 'commitBookingData.strBookId': '' }
      ]
    }).sort({ createdAt: -1 }).limit(10).toArray();

    console.log(`Found ${paidNoTicket.length} records where payment succeeded but ticket not booked:`);
    for (const tx of paidNoTicket) {
      console.log({
        id: tx._id,
        createdAt: tx.createdAt,
        transId: tx.transId || tx.initTransId,
        status: tx.status,
        refundStatus: tx.refundStatus,
        refundResponse: tx.refundResponse ? 'Yes' : 'No',
        paymentsStatus: tx.paymentsStatus,
        payment_id: tx.paymentResponse?.razorpay_payment_id,
        amount: tx.paymentResponse?.amount,
        strException: tx.vistaErrorResponse?.data || tx.addSeatData?.strException
      });
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error("Error:", err);
  }
}

run();
