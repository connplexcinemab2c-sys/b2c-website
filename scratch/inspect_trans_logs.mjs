import dotenv from 'dotenv';
import mongoose from 'mongoose';
dotenv.config({ path: 'Backend/.env' });

async function check() {
  await mongoose.connect(process.env.MONGO_URL);
  const logs = await mongoose.connection.db.collection('logs')
    .find({ transaction_id: '20000127419' })
    .toArray();
  
  console.log("LOGS for 20000127419:", JSON.stringify(logs, null, 2));

  // Also check vista_logs if it exists
  const collections = await mongoose.connection.db.listCollections().toArray();
  const collNames = collections.map(c => c.name);
  console.log("Collection names:", collNames.filter(c => c.includes('log') || c.includes('vista')));

  process.exit(0);
}
check().catch(console.error);
