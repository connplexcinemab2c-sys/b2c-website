import mongoose from 'mongoose';

async function run() {
  await mongoose.connect('mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin');
  const db = mongoose.connection.db;

  const start = new Date('2026-10-25T00:00:00.000+05:30');
  const now = new Date('2026-10-31T23:59:59.999+05:30');

  console.log("=== Checking universallogs for refund ===");
  const refundLogs = await db.collection('universallogs').find({
    $or: [
      { "steps.logType": "refundResponse" },
      { "steps.message": /refund/i },
      { "step.logType": "refundResponse" },
      { "step.message": /refund/i },
      { type: /refund/i }
    ]
  }).toArray();
  console.log(`Found ${refundLogs.length} refund logs in universallogs`);
  for (const r of refundLogs) {
    console.log(JSON.stringify(r, null, 2));
  }

  console.log("\n=== Checking transactions for logs with 'ticketRefunded' or 'refund' ===");
  const txWithRefundLogs = await db.collection('transactions').find({
    "logs": {
      $elemMatch: {
        $or: [
          { "ticketRefunded": { $exists: true } },
          { "refund": { $exists: true } }
        ]
      }
    }
  }).toArray();
  console.log(`Found ${txWithRefundLogs.length} in transactions.logs`);
  for (const t of txWithRefundLogs) {
    console.log(t._id, t.initTransId, t.logs);
  }

  // Also search universallogs this week for any mention of refund in string representation
  const allRecentLogs = await db.collection('universallogs').find({
    createdAt: { $gte: start, $lte: now }
  }).toArray();
  console.log(`\nTotal universallogs this week: ${allRecentLogs.length}`);
  const matchingRecentLogs = allRecentLogs.filter(l => JSON.stringify(l).toLowerCase().includes('refund'));
  console.log(`Matching 'refund' in recent universallogs: ${matchingRecentLogs.length}`);
  for (const m of matchingRecentLogs) {
    console.log(JSON.stringify(m, null, 2));
  }

  await mongoose.disconnect();
}

run();
