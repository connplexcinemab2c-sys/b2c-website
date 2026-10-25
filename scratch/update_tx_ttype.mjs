import dotenv from 'dotenv';
import mongoose from 'mongoose';
dotenv.config({ path: 'Backend/.env' });

async function run() {
  await mongoose.connect(process.env.MONGO_URL);
  await mongoose.connection.db.collection('transactions').updateOne(
    { initTransId: '20000127421' },
    { $set: { tTypeCode: '0001', 'addSeatData.tTypeCode': '0001', 'addSeatData.strType': '0001' } }
  );
  console.log("Transaction 20000127421 updated with tTypeCode: '0001'");
  process.exit(0);
}
run().catch(console.error);
