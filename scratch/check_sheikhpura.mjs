import mongoose from 'mongoose';

async function run() {
  await mongoose.connect('mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin');
  const db = mongoose.connection.db;

  const txIds = ['20000002921', '20000002924'];

  for (const transId of txIds) {
    console.log(`\n=================== TRANSACTION ${transId} ===================`);
    const tx = await db.collection('transactions').findOne({ initTransId: transId });
    if (!tx) {
      console.log('Not found');
      continue;
    }

    console.log('Transaction Summary:');
    console.log({
      _id: tx._id,
      initTransId: tx.initTransId,
      status: tx.status,
      cinemaId: tx.cinemaId,
      user_id: tx.user_id,
      paymentResponse: tx.paymentResponse,
      tickets: tx.tickets,
      totalAmount: tx.totalAmount,
      finalAmount: tx.finalAmount,
      totalDiscount: tx.totalDiscount,
      couponCode: tx.couponCode,
      settlementMode: tx.settlementMode,
      settlementNotes: tx.settlementNotes,
      vistaPaymentDetails: tx.vistaPaymentDetails,
      createdAt: tx.createdAt,
      updatedAt: tx.updatedAt
    });

    console.log('\n--- Universal Logs ---');
    const uLogs = await db.collection('universallogs').find({ transId: transId }).toArray();
    for (const l of uLogs) {
      console.log(`[${l.createdAt?.toISOString()}] ${l.type || l.action}:`, JSON.stringify(l.data || l.message || l, null, 2));
    }

    console.log('\n--- Vista Logs ---');
    const vLogs = await db.collection('vistalogs').find({
      $or: [
        { transId: transId },
        { 'data.transId': transId },
        { 'data.TransId': transId },
        { 'request.transId': transId }
      ]
    }).toArray();
    for (const v of vLogs) {
      console.log(`[${v.createdAt?.toISOString()}] ${v.method || v.action || v.type}:`, {
        request: v.request || v.data?.request,
        response: v.response || v.data?.response,
        error: v.error || v.data?.error
      });
    }
  }

  await mongoose.disconnect();
}

run().catch(console.error);
