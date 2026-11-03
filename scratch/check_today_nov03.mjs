import mongoose from 'mongoose';

async function run() {
  await mongoose.connect('mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin');
  const db = mongoose.connection.db;

  const todayStart = new Date('2026-11-03T00:00:00.000+05:30');
  const now = new Date();

  const totalToday = await db.collection('transactions').countDocuments({
    status: { $ne: 0 },
    createdAt: { $gte: todayStart, $lte: now }
  });

  const status1 = await db.collection('transactions').countDocuments({
    status: 1,
    createdAt: { $gte: todayStart, $lte: now }
  });
  const status2 = await db.collection('transactions').countDocuments({
    status: 2,
    createdAt: { $gte: todayStart, $lte: now }
  });
  const status4 = await db.collection('transactions').countDocuments({
    status: 4,
    createdAt: { $gte: todayStart, $lte: now }
  });

  console.log(`Today (03/11/2026) IST so far:`);
  console.log(`Total (status != 0): ${totalToday}`);
  console.log(`Status 1 (Success): ${status1}`);
  console.log(`Status 2 (Abandoned/Unpaid): ${status2}`);
  console.log(`Status 4 (Paid Failures): ${status4}`);

  if (status4 > 0) {
    const s4List = await db.collection('transactions').find({
      status: 4,
      createdAt: { $gte: todayStart, $lte: now }
    }).toArray();
    console.log(`\nFound ${s4List.length} Status 4 transactions today:`);
    for (const t of s4List) {
      console.log(`TX: ${t.initTransId} | IST: ${new Date(t.createdAt).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' })} | ₹${t.finalBookingCalculation?.finalAmount || t.paymentResponse?.amount}`);
      console.log('   MovieId:', t.movieId, 'CinemaId:', t.cinemaId);
      console.log('   Vista error:', t.vistaErrorResponse);
    }
  }

  await mongoose.disconnect();
}

run();
