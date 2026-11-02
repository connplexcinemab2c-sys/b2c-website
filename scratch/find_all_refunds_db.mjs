import mongoose from 'mongoose';

async function run() {
  await mongoose.connect('mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin');
  const db = mongoose.connection.db;

  const collections = await db.listCollections().toArray();
  const start = new Date('2026-10-25T00:00:00.000+05:30');
  const now = new Date('2026-10-31T23:59:59.999+05:30');

  console.log(`Scanning ${collections.length} collections for recent updates or refunds...`);

  for (const col of collections) {
    const name = col.name;
    try {
      // Find any doc created or updated this week
      const countThisWeek = await db.collection(name).countDocuments({
        $or: [
          { createdAt: { $gte: start, $lte: now } },
          { updatedAt: { $gte: start, $lte: now } }
        ]
      });

      if (countThisWeek > 0) {
        console.log(`Collection [${name}]: ${countThisWeek} docs this week`);

        // Check if any has 'refund' in stringified content or field
        const docs = await db.collection(name).find({
          $or: [
            { createdAt: { $gte: start, $lte: now } },
            { updatedAt: { $gte: start, $lte: now } }
          ]
        }).limit(50).toArray();

        let refundDocs = 0;
        for (const doc of docs) {
          const s = JSON.stringify(doc).toLowerCase();
          if (s.includes('refund')) {
            refundDocs++;
            console.log(`  --> Found doc with 'refund' in [${name}]: ID ${doc._id}`);
            console.log(JSON.stringify(doc, null, 2).slice(0, 500));
          }
        }
      }
    } catch (e) {
      // Ignore collections without those fields
    }
  }

  await mongoose.disconnect();
}

run();
