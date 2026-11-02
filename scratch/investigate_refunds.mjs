import mongoose from 'mongoose';

async function run() {
  await mongoose.connect('mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin');
  const db = mongoose.connection.db;

  // Let's check ticketcancels collection
  const tcCollections = await db.listCollections().toArray();
  const cNames = tcCollections.map(c => c.name);
  console.log("Collections with 'ticket', 'cancel', 'refund':", cNames.filter(n => /ticket|cancel|refund/i.test(n)));

  const start = new Date('2026-10-25T00:00:00.000+05:30');
  const now = new Date('2026-10-31T23:59:59.999+05:30');

  // Check ticketcancels
  if (cNames.includes('ticketcancels')) {
    const tcThisWeek = await db.collection('ticketcancels').find({
      $or: [
        { createdAt: { $gte: start, $lte: now } },
        { updatedAt: { $gte: start, $lte: now } }
      ]
    }).toArray();
    console.log(`\nticketcancels this week: ${tcThisWeek.length}`);
    for (const tc of tcThisWeek) {
      console.log(JSON.stringify(tc, null, 2));
    }

    const tcAllRecent = await db.collection('ticketcancels').find().sort({ createdAt: -1 }).limit(10).toArray();
    console.log(`\nLast 10 ticketcancels overall:`);
    for (const tc of tcAllRecent) {
      console.log(`ID: ${tc._id}, date: ${tc.createdAt}, reason: ${tc.reason || tc.cancelReason || tc.notes}, amount: ${tc.refundAmount || tc.amount}, status: ${tc.status}`);
    }
  }

  // Check transactions with refundStatus: true or refundResponse exists or refundAmount exists
  const txRefunds = await db.collection('transactions').find({
    $or: [
      { refundStatus: true },
      { refundResponse: { $exists: true, $ne: null } },
      { refundAmount: { $exists: true, $gt: 0 } },
      { status: 3 }
    ]
  }).sort({ updatedAt: -1 }).limit(20).toArray();

  console.log(`\nTransactions with refund markers (total matched in query: ${txRefunds.length}):`);
  for (const t of txRefunds) {
    console.log({
      id: t._id,
      transId: t.transId || t.initTransId,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
      status: t.status,
      refundStatus: t.refundStatus,
      refundAmount: t.refundAmount,
      refundNote: t.refundNote,
      refundResponse: t.refundResponse,
      cancellationReason: t.cancellationReason || t.cancelReason || t.notes
    });
  }

  // Also check transactions whose updatedAt is this week
  const txUpdatedThisWeekWithRefund = await db.collection('transactions').find({
    updatedAt: { $gte: start, $lte: now },
    $or: [
      { refundStatus: true },
      { refundResponse: { $exists: true, $ne: null } },
      { refundAmount: { $exists: true, $gt: 0 } },
      { status: 3 },
      { cancellationStatus: true }
    ]
  }).toArray();
  console.log(`\nTransactions updated this week with refund/cancellation: ${txUpdatedThisWeekWithRefund.length}`);
  for (const t of txUpdatedThisWeekWithRefund) {
    console.log({
      id: t._id,
      transId: t.transId || t.initTransId,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
      refundStatus: t.refundStatus,
      refundAmount: t.refundAmount,
      refundNote: t.refundNote,
      refundResponse: t.refundResponse
    });
  }

  await mongoose.disconnect();
}

run().catch(console.error);
