import mongoose from 'mongoose';

async function run() {
  await mongoose.connect('mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin');
  const db = mongoose.connection.db;

  const collections = await db.listCollections().toArray();
  console.log('Collections:', collections.map(c => c.name));

  // Find any record containing 20000002924 or 20000002921 in all log-related collections
  const logCols = ['vistalogs', 'universallogs', 'transactionlogs', 'logs'];
  for (const c of logCols) {
    if (collections.some(x => x.name === c)) {
      const sample = await db.collection(c).findOne();
      console.log(`\nSample from ${c}:`, Object.keys(sample || {}));
      
      const found = await db.collection(c).find({
        $or: [
          { transId: { $in: ['20000002924', '20000002921'] } },
          { initTransId: { $in: ['20000002924', '20000002921'] } },
          { TransId: { $in: ['20000002924', '20000002921'] } },
          { 'data.transId': { $in: ['20000002924', '20000002921'] } }
        ]
      }).toArray();
      console.log(`Found in ${c}: ${found.length}`);
      for (const f of found) {
        console.log(f);
      }
    }
  }

  // Also check transaction itself: print full object keys and values
  const t24 = await db.collection('transactions').findOne({ initTransId: '20000002924' });
  console.log('\nFull transaction 20000002924:');
  console.log(JSON.stringify(t24, null, 2));

  await mongoose.disconnect();
}

run().catch(console.error);
