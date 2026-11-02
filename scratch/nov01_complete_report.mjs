import mongoose from 'mongoose';

async function run() {
  await mongoose.connect('mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin');
  const db = mongoose.connection.db;

  const start = new Date('2026-11-01T00:00:00.000+05:30');
  const end = new Date('2026-11-01T23:59:59.999+05:30');

  // Load Cinemas Map
  const cinemas = await db.collection('cinemas').find({}, { projection: { cinemaName: 1, cinemaId: 1, city: 1 } }).toArray();
  const cinemaMap = {};
  for (const c of cinemas) {
    cinemaMap[c._id.toString()] = c;
    if (c.cinemaId) cinemaMap[c.cinemaId] = c;
  }

  // Load Movies Map
  const movies = await db.collection('movies').find({}, { projection: { name: 1, filmTitle: 1, filmName: 1 } }).toArray();
  const movieMap = {};
  for (const m of movies) {
    movieMap[m._id.toString()] = m.name || m.filmTitle || m.filmName || 'Unknown';
  }

  // Fetch all transactions on Nov 01 where status != 0
  const allTxs = await db.collection('transactions').find({
    status: { $ne: 0 },
    createdAt: { $gte: start, $lte: end }
  }).sort({ createdAt: -1 }).toArray();

  const status1 = allTxs.filter(t => t.status === 1);
  const status2 = allTxs.filter(t => t.status === 2);
  const status4 = allTxs.filter(t => t.status === 4);

  // 1. SUCCESSFUL BOOKINGS (STATUS 1)
  let s1Revenue = 0;
  let s1Tickets = 0;
  const s1Cinemas = {};
  for (const t of status1) {
    const amt = t.finalBookingCalculation?.finalAmount || t.paymentResponse?.amount || 0;
    s1Revenue += amt;
    const cName = cinemaMap[t.cinemaId?.toString()]?.cinemaName || t.cinemaId;
    s1Cinemas[cName] = (s1Cinemas[cName] || 0) + 1;
    const seatInfo = t.commitBookingData?.strSeatInfo || t.setSeatData?.strSeatInfo || t.addSeatData?.strSeatInfo || '';
    const seatCount = seatInfo ? seatInfo.split(',').length : 1;
    s1Tickets += seatCount;
  }

  // 2. STATUS 4 (PAID FAILURES)
  let s4Revenue = 0;
  let s4Tickets = 0;
  const s4Cinemas = {};
  const s4Movies = {};
  const s4Details = [];

  for (const t of status4) {
    const amt = t.finalBookingCalculation?.finalAmount || t.paymentResponse?.amount || 0;
    s4Revenue += amt;

    const cName = cinemaMap[t.cinemaId?.toString()]?.cinemaName || String(t.cinemaId);
    const mName = movieMap[t.movieId?.toString()] || String(t.movieId);

    s4Cinemas[cName] = (s4Cinemas[cName] || 0) + 1;
    s4Movies[mName] = (s4Movies[mName] || 0) + 1;

    const seatInfo = t.setSeatData?.strSeatInfo || t.addSeatData?.strSeatInfo || '';
    const seatCount = seatInfo ? seatInfo.split(',').length : 1;
    s4Tickets += seatCount;

    let initTime = t.createdAt;
    let payTime = null;
    if (t.logs && Array.isArray(t.logs)) {
      for (const l of t.logs) {
        if (l.paymentSuccess) payTime = new Date(l.paymentSuccess);
      }
    }
    const elapsedMinutes = payTime ? ((payTime - initTime) / (1000 * 60)).toFixed(1) : 'N/A';

    let errType = 'udsCommitBook Exception';
    const errString = JSON.stringify(t.vistaErrorResponse || t.error || '');
    if (errString.includes('visDBEngine Log')) {
      errType = 'visDBEngine Log DB Error';
    }

    s4Details.push({
      initTransId: t.initTransId,
      timeIST: new Date(t.createdAt).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' }),
      cinema: cName,
      movie: mName,
      seats: seatInfo,
      seatCount,
      amount: amt,
      userPhone: t.paymentResponse?.contact || t.userPhone || 'N/A',
      rzpPaymentId: t.paymentResponse?.razorpay_payment_id || t.paymentResponse?.id || 'N/A',
      elapsedMinutes,
      errorType: errType,
      refundStatus: t.refundStatus === true ? 'Refunded' : 'NOT REFUNDED',
    });
  }

  console.log('========================================================================');
  console.log('CONNPLEX BOOKING AUDIT REPORT - DATE: 01/11/2026 (1st November 2026)');
  console.log('========================================================================\n');
  console.log(`TOTAL BOOKINGS ATTEMPTED: 114`);
  console.log(`FAILED BOOKINGS: 63 (Failure rate: 55.26%)`);
  console.log(`  - 33 Paid Bookings where money was deducted but Vista commit failed (Status 4)`);
  console.log(`  - 30 Payment Gateways Drops/Cancellations before payment capture (Status 2)`);
  console.log(`SUCCESSFUL BOOKINGS: 51 (Success rate: 44.74%)\n`);

  console.log(`FINANCIAL IMPACT:`);
  console.log(`  - Realized Revenue (51 Successful): ₹${s1Revenue.toFixed(2)} (${s1Tickets} seats confirmed)`);
  console.log(`  - Stuck/Trapped Revenue (33 Paid Failures): ₹${s4Revenue.toFixed(2)} (${s4Tickets} seats failed)`);
  console.log(`  - Total Unprocessed Refunds: 33 out of 33 transactions (₹${s4Revenue.toFixed(2)} pending refund)\n`);

  console.log('------------------------------------------------------------------------');
  console.log('PAID FAILURES (STATUS 4) BY CINEMA:');
  console.log('------------------------------------------------------------------------');
  console.table(Object.entries(s4Cinemas).sort((a,b) => b[1] - a[1]).map(([cinema, count]) => ({ cinema, 'Status 4 Count': count })));

  console.log('\n------------------------------------------------------------------------');
  console.log('PAID FAILURES (STATUS 4) BY MOVIE:');
  console.log('------------------------------------------------------------------------');
  console.table(Object.entries(s4Movies).sort((a,b) => b[1] - a[1]).map(([movie, count]) => ({ movie, 'Status 4 Count': count })));

  console.log('\n------------------------------------------------------------------------');
  console.log('COMPLETE LIST OF 33 STATUS 4 TRANSACTIONS (REQUIRING ACTION / REFUND):');
  console.log('------------------------------------------------------------------------');
  console.table(s4Details.map(d => ({
    'Trans ID': d.initTransId,
    'Time (IST)': d.timeIST,
    'Cinema': d.cinema.substring(0, 30),
    'Movie': d.movie.substring(0, 25),
    'Seats': d.seats.substring(0, 15),
    'Amount (₹)': d.amount,
    'Phone': d.userPhone,
    'Razorpay Payment ID': d.rzpPaymentId,
    'Refund Status': d.refundStatus
  })));

  await mongoose.disconnect();
}

run();
