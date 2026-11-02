import mongoose from 'mongoose';

async function run() {
  await mongoose.connect('mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin');
  const db = mongoose.connection.db;

  const start = new Date('2026-10-25T00:00:00.000+05:30');
  const now = new Date('2026-10-31T23:59:59.999+05:30');

  console.log("=== Checking vistalogs this week for Refund/Cancel ===");
  const vistaRefundLogs = await db.collection('vistalogs').find({
    createdAt: { $gte: start, $lte: now },
    $or: [
      { apiName: /refund/i },
      { apiName: /cancel/i },
      { method: /refund/i },
      { method: /cancel/i },
      { request: /refund/i },
      { response: /refund/i },
      { type: /refund/i }
    ]
  }).toArray();

  console.log(`Found ${vistaRefundLogs.length} vistalogs for refund/cancel this week:`);
  for (const vl of vistaRefundLogs) {
    console.log(JSON.stringify(vl, null, 2).slice(0, 500));
  }

  // Also check all vistalogs regardless of date to see what apiName exists
  const distinctApiNames = await db.collection('vistalogs').distinct('apiName');
  console.log('\nDistinct apiNames in vistalogs:', distinctApiNames);

  // Distinct methods in vistalogs
  const distinctMethods = await db.collection('vistalogs').distinct('method');
  console.log('Distinct methods in vistalogs:', distinctMethods);

  await mongoose.disconnect();
}

run();
