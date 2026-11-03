import mongoose from 'mongoose';

async function run() {
  await mongoose.connect('mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin');
  const db = mongoose.connection.db;

  const cinemas = await db.collection('cinemas').find({}, { projection: { cinemaName: 1, cinemaId: 1 } }).toArray();
  const cinemaMap = {};
  for (const c of cinemas) cinemaMap[c._id.toString()] = c.cinemaName;

  const movies = await db.collection('movies').find({}, { projection: { name: 1 } }).toArray();
  const movieMap = {};
  for (const m of movies) movieMap[m._id.toString()] = m.name;

  const todayStart = new Date('2026-11-03T00:00:00.000+05:30');
  const now = new Date();

  const s4Today = await db.collection('transactions').find({
    status: 4,
    createdAt: { $gte: todayStart, $lte: now }
  }).sort({ createdAt: 1 }).toArray();

  console.log(`=== 6 STATUS 4 TRANSACTIONS FROM TODAY (03/11/2026) ===\n`);
  let totalAmt = 0;

  for (const [i, t] of s4Today.entries()) {
    const amt = Number(t.finalBookingCalculation?.finalAmount || t.paymentResponse?.amount || 0);
    totalAmt += amt;
    const cName = cinemaMap[t.cinemaId?.toString()] || 'Unknown Cinema';
    const mName = movieMap[t.movieId?.toString()] || 'Unknown Movie';
    const timeIST = new Date(t.createdAt).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' });

    console.log(`[${i+1}] ID: ${t.initTransId} | IST: ${timeIST} | ₹${amt}`);
    console.log(`    Cinema: ${cName}`);
    console.log(`    Movie: ${mName}`);
    console.log(`    Phone: ${t.paymentResponse?.contact || t.userPhone} | PayId: ${t.paymentResponse?.razorpay_payment_id || t.paymentResponse?.id}`);
    console.log(`    Seats: ${t.setSeatData?.strSeatInfo || t.addSeatData?.strSeatInfo}`);
    console.log(`    addSeatData: curTickets=${t.addSeatData?.curTicketsTotal}, curFood=${t.addSeatData?.curFoodTotal}, curTotal=${t.addSeatData?.curTotal}`);
    console.log('------------------------------------------------------------');
  }

  console.log(`Total trapped money today: ₹${totalAmt.toFixed(2)}`);

  await mongoose.disconnect();
}

run();
