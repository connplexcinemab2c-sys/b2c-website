import mongoose from 'mongoose';

async function run() {
  await mongoose.connect('mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin');
  const db = mongoose.connection.db;

  const t21 = await db.collection('transactions').findOne({ initTransId: '20000002921' });
  console.log('\nFull transaction 20000002921:');
  console.log(JSON.stringify(t21, null, 2));

  await mongoose.disconnect();
}

run().catch(console.error);
