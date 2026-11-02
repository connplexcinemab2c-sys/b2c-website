import mongoose from 'mongoose';

async function run() {
  await mongoose.connect('mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin');
  const db = mongoose.connection.db;

  // Check collections related to logs
  const collections = await db.listCollections().toArray();
  console.log('Collections:', collections.map(c => c.name).filter(n => n.toLowerCase().includes('log') || n.toLowerCase().includes('vista')));

  // Check sample from vistalogs
  const sampleLog = await db.collection('vistalogs').findOne({
    transaction_id: '20000041881'
  });
  console.log('Sample vistalog for 20000041881:', JSON.stringify(sampleLog, null, 2));

  // Check recent logs for Nov 01 Status 4
  const status4Tx = await db.collection('transactions').findOne({
    status: 4,
    createdAt: { $gte: new Date('2026-11-01T00:00:00.000+05:30') }
  });
  console.log('Checking logs for tx:', status4Tx.initTransId);
  const txLogs = await db.collection('vistalogs').find({
    transaction_id: status4Tx.initTransId
  }).toArray();
  console.log('txLogs count:', txLogs.length);
  for (const l of txLogs) {
    console.log(JSON.stringify(l, null, 2));
  }

  await mongoose.disconnect();
}

run();
