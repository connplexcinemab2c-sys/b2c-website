import mongoose from 'mongoose';

async function run() {
  await mongoose.connect('mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin');
  const db = mongoose.connection.db;

  const start = new Date('2026-10-25T00:00:00.000+05:30');
  const now = new Date('2026-10-31T23:59:59.999+05:30');

  const types = await db.collection('vistalogs').distinct('type', { createdAt: { $gte: start, $lte: now } });
  console.log("Distinct types in vistalogs this week:", types);

  const refundLogs = await db.collection('vistalogs').find({
    createdAt: { $gte: start, $lte: now },
    $or: [
      { type: /refund/i },
      { type: /cancel/i },
      { moduleName: /refund/i },
      { moduleName: /cancel/i },
      { vistaRequest: /refund/i },
      { vistaRequest: /cancel/i }
    ]
  }).toArray();
  console.log(`Found ${refundLogs.length} vistalogs matching refund/cancel this week.`);
  for (const l of refundLogs) {
    console.log(l);
  }

  await mongoose.disconnect();
}

run();
