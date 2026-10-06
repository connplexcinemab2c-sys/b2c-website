import mongoose from 'mongoose';

async function run() {
  try {
    await mongoose.connect('mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin');
    const db = mongoose.connection.db;

    const start = new Date('2026-10-01T00:00:00.000+05:30');
    const end = new Date('2026-10-04T23:59:59.999+05:30');

    // 1. Payment gateway breakdown for Status 4 & 5
    const txs = await db.collection('transactions').find({
      deletedStatus: 0,
      createdAt: { $gte: start, $lte: end },
      status: { $in: [4, 5] }
    }).toArray();

    const pgBreakdown = {};
    for (const t of txs) {
      const key = `status_${t.status} | pg_${t.paymentFrom || 'unknown'}`;
      pgBreakdown[key] = (pgBreakdown[key] || 0) + 1;
    }
    console.log("=== Payment Gateway Breakdown ===");
    console.table(pgBreakdown);

    // 2. Inspect 5 sample Status 4 transactions
    console.log("\n=== 5 Sample Status 4 Transactions ===");
    const sample4 = txs.filter(t => t.status === 4).slice(0, 5);
    for (const t of sample4) {
      console.log({
        _id: t._id,
        initTransId: t.initTransId,
        cinemaId: t.cinemaId,
        paymentFrom: t.paymentFrom,
        createdAt: t.createdAt,
        paymentsStatus: t.paymentsStatus,
        commitStatus: t.commitStatus,
        vistaErrorResponse: t.vistaErrorResponse,
        logs: t.logs,
        finalBookingCalculation: t.finalBookingCalculation,
        paymentResponse: {
          id: t.paymentResponse?.id || t.paymentResponse?.razorpay_payment_id,
          status: t.paymentResponse?.status || t.paymentResponse?.order_status,
          amount: t.paymentResponse?.amount,
          method: t.paymentResponse?.method,
        }
      });
    }

    // 3. Inspect Vista logs for one of these Status 4 transactions
    if (sample4.length > 0) {
      const transId = sample4[0].initTransId;
      console.log(`\n=== Checking logs in vistalogs / universallogs for initTransId: ${transId} ===`);
      const vLogs = await db.collection('vistalogs').find({
        $or: [
          { "data.strTransId": transId },
          { "request.strTransId": transId },
          { transId: transId },
          { initTransId: transId }
        ]
      }).toArray();
      console.log("vistalogs count:", vLogs.length);
      for (const vl of vLogs) {
        console.log(JSON.stringify(vl, null, 2));
      }

      const uLogs = await db.collection('universallogs').find({
        $or: [
          { "data.strTransId": transId },
          { "request.strTransId": transId },
          { transId: transId },
          { initTransId: transId },
          { transaction_id: transId }
        ]
      }).toArray();
      console.log("universallogs count:", uLogs.length);
      for (const ul of uLogs) {
        console.log(JSON.stringify(ul, null, 2));
      }
    }

    // 4. Inspect 5 sample Status 5 transactions
    console.log("\n=== 5 Sample Status 5 Transactions ===");
    const sample5 = txs.filter(t => t.status === 5).slice(0, 5);
    for (const t of sample5) {
      console.log({
        _id: t._id,
        initTransId: t.initTransId,
        cinemaId: t.cinemaId,
        paymentFrom: t.paymentFrom,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
        paymentResponse: t.paymentResponse,
        razorpayOrderId: t.razorpayOrderId,
        razorpayPaymentId: t.razorpayPaymentId
      });
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

run();
