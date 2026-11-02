import mongoose from 'mongoose';

async function run() {
  await mongoose.connect('mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin');
  const db = mongoose.connection.db;

  const collections = await db.listCollections().toArray();
  const names = collections.map(c => c.name);
  console.log("Collections:", names.filter(n => n.toLowerCase().includes('book') || n.toLowerCase().includes('trans')));

  const start = new Date('2026-10-26T00:00:00.000+05:30');
  const end = new Date('2026-10-31T23:59:59.999+05:30');

  // Check group bookings
  const gb = await db.collection('groupbookings').countDocuments({ createdAt: { $gte: start, $lte: end } });
  console.log("Group bookings this week:", gb);

  await mongoose.disconnect();
}

run();
