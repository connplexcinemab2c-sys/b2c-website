import mongoose from 'mongoose';

async function run() {
  await mongoose.connect('mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin');
  const db = mongoose.connection.db;

  const sinceOct11 = await db.collection('transactions').find({
    createdAt: { $gte: new Date('2026-10-11T18:30:00.000Z') }
  }).toArray();

  console.log('Total transactions since Oct 12 IST:', sinceOct11.length);
  const utmBreakdown = {};
  for (const t of sinceOct11) {
    const src = t.utm_source || 'direct/null';
    utmBreakdown[src] = (utmBreakdown[src] || 0) + 1;
  }
  console.log('UTM source breakdown since Oct 12:', utmBreakdown);

  await mongoose.disconnect();
}

run();
