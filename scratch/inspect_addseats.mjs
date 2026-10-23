import dotenv from 'dotenv';
import mongoose from 'mongoose';
dotenv.config({ path: 'Backend/.env' });

async function check() {
  await mongoose.connect(process.env.MONGO_URL);
  const txs = await mongoose.connection.db.collection('transactions')
    .find({ addSeatData: { $ne: null } })
    .sort({ createdAt: -1 })
    .limit(5)
    .toArray();
  
  for (const tx of txs) {
    console.log(`\n--- TransId: ${tx.initTransId} ---`);
    console.log('addSeatData keys:', Object.keys(tx.addSeatData));
    console.log('addSeatData:', JSON.stringify(tx.addSeatData, null, 2));
  }
  process.exit(0);
}
check().catch(console.error);
