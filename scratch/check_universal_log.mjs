import mongoose from 'mongoose';

async function run() {
  await mongoose.connect('mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin');
  const db = mongoose.connection.db;

  const log = await db.collection('universallogs').findOne({ transaction_id: '20000232121' });
  console.log('UniversalLog for 20000232121:');
  console.log(JSON.stringify(log, null, 2));

  await mongoose.disconnect();
}

run();
