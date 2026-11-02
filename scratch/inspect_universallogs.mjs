import mongoose from 'mongoose';

async function run() {
  await mongoose.connect('mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin');
  const db = mongoose.connection.db;

  const start = new Date('2026-11-01T00:00:00.000+05:30');
  const end = new Date('2026-11-01T23:59:59.999+05:30');

  const status4Txs = await db.collection('transactions').find({
    status: 4,
    createdAt: { $gte: start, $lte: end }
  }).toArray();

  console.log(`Checking universallogs for ${status4Txs.length} transactions:`);

  for (let i = 0; i < Math.min(5, status4Txs.length); i++) {
    const tx = status4Txs[i];
    const log = await db.collection('universallogs').findOne({
      transaction_id: tx.initTransId
    });
    console.log(`\n--- Tx: ${tx.initTransId} ---`);
    if (!log) {
      console.log('No universallog found.');
    } else {
      console.log('Steps count:', log.steps?.length);
      for (const s of log.steps || []) {
        console.log(`  Step: logType=${s.logType}, success=${s.success}, message=${s.message}`);
        if (s.error) console.log(`    Error:`, s.error);
        if (s.response) console.log(`    Response:`, s.response);
      }
    }
  }

  await mongoose.disconnect();
}

run();
