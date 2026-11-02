import mongoose from 'mongoose';

async function run() {
  await mongoose.connect('mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin');
  const db = mongoose.connection.db;

  const count = await db.collection('webhookresponses').countDocuments();
  console.log(`Total webhookresponses: ${count}`);

  const webhooks = await db.collection('webhookresponses').find().sort({ createdAt: -1 }).limit(100).toArray();
  console.log(`Checking last 100 webhookresponses...`);

  const refundWebhooks = [];
  for (const w of webhooks) {
    const s = JSON.stringify(w);
    if (/refund/i.test(s)) {
      refundWebhooks.push(w);
    }
  }

  console.log(`Found ${refundWebhooks.length} webhooks mentioning refund:`);
  for (const rw of refundWebhooks) {
    console.log(JSON.stringify(rw, null, 2));
  }

  await mongoose.disconnect();
}

run();
