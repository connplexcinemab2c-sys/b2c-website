import mongoose from 'mongoose';

async function run() {
  await mongoose.connect('mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin');
  const db = mongoose.connection.db;

  const logs = await db.collection('logs').find({ transaction_id: '20000232121' }).toArray();
  console.log(`Found ${logs.length} logs for 20000232121:`);
  for (const l of logs) {
    console.log(JSON.stringify(l, null, 2));
  }

  await mongoose.disconnect();
}

run();
