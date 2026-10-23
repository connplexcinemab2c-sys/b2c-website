import dotenv from 'dotenv';
import mongoose from 'mongoose';
dotenv.config({ path: 'Backend/.env' });

async function check() {
  await mongoose.connect(process.env.MONGO_URL);
  const vlogs = await mongoose.connection.db.collection('vistalogs')
    .find({ $or: [{ transId: '20000127419' }, { strTransId: '20000127419' }, { transactionId: '20000127419' }] })
    .toArray();
  console.log("VISTALOGS:", JSON.stringify(vlogs, null, 2));

  const tlogs = await mongoose.connection.db.collection('transactionlogs')
    .find({ $or: [{ transId: '20000127419' }, { strTransId: '20000127419' }, { transactionId: '20000127419' }] })
    .toArray();
  console.log("TRANSACTIONLOGS:", JSON.stringify(tlogs, null, 2));

  const ulogs = await mongoose.connection.db.collection('universallogs')
    .find({ $or: [{ transId: '20000127419' }, { strTransId: '20000127419' }, { transaction_id: '20000127419' }] })
    .toArray();
  console.log("UNIVERSALLOGS:", JSON.stringify(ulogs, null, 2));

  process.exit(0);
}
check().catch(console.error);
