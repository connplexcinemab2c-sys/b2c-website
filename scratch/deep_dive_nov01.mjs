import mongoose from 'mongoose';

async function run() {
  await mongoose.connect('mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin');
  const db = mongoose.connection.db;

  const start = new Date('2026-11-01T00:00:00.000+05:30');
  const end = new Date('2026-11-01T23:59:59.999+05:30');

  // Fetch all 114 transactions where status != 0
  const txs = await db.collection('transactions').find({
    status: { $ne: 0 },
    createdAt: { $gte: start, $lte: end }
  }).toArray();

  console.log(`Total transactions fetched: ${txs.length}`);

  // Fetch cinema map
  const cinemas = await db.collection('cinemas').find({}).toArray();
  const cinemaMap = {};
  for (const c of cinemas) {
    cinemaMap[c._id.toString()] = c;
    if (c.cinemaId) cinemaMap[c.cinemaId] = c;
  }

  // Fetch movie map
  const movies = await db.collection('movies').find({}).toArray();
  const movieMap = {};
  for (const m of movies) {
    movieMap[m._id.toString()] = m;
  }

  // Let's analyze Status 4 (Paid Failures: 33)
  const status4 = txs.filter(t => t.status === 4);
  console.log(`\n=== STATUS 4 (PAID BUT COMMIT FAILED): ${status4.length} ===`);

  const status4Errors = {};
  const status4Cinemas = {};
  const status4Movies = {};
  let totalStatus4Amount = 0;
  let refundedCount = 0;

  for (const t of status4) {
    const cName = cinemaMap[t.cinemaId?.toString()]?.cinemaName || t.cinemaId || 'Unknown Cinema';
    const mName = movieMap[t.movieId?.toString()]?.filmTitle || movieMap[t.movieId?.toString()]?.filmName || t.movieId || 'Unknown Movie';
    const amt = t.finalAmount || (t.paymentResponse?.amount ? t.paymentResponse.amount / 100 : 0);
    totalStatus4Amount += amt;

    status4Cinemas[cName] = (status4Cinemas[cName] || 0) + 1;
    status4Movies[mName] = (status4Movies[mName] || 0) + 1;

    if (t.refundStatus || t.isRefunded) refundedCount++;

    // Extract error
    const errStr = JSON.stringify(t.vistaErrorResponse || t.error || t.errorMessage || t.commitBookingData || 'No error field');
    status4Errors[errStr] = (status4Errors[errStr] || 0) + 1;
  }

  console.log('Status 4 by Cinema:', status4Cinemas);
  console.log('Status 4 by Movie:', status4Movies);
  console.log('Status 4 Total Amount: ₹' + totalStatus4Amount);
  console.log('Status 4 Refunded Count:', refundedCount);
  console.log('Status 4 Errors breakdown:');
  for (const [err, count] of Object.entries(status4Errors)) {
    console.log(`Count: ${count}\nError: ${err.substring(0, 300)}\n---`);
  }

  // Let's inspect individual Status 4 details
  console.log('\n--- Details of Status 4 transactions ---');
  for (const t of status4) {
    const cName = cinemaMap[t.cinemaId?.toString()]?.cinemaName || t.cinemaId;
    const mName = movieMap[t.movieId?.toString()]?.filmTitle || movieMap[t.movieId?.toString()]?.filmName || t.movieId;
    console.log({
      id: t._id.toString(),
      transId: t.transId || t.initTransId,
      time: new Date(t.createdAt).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' }),
      cinema: cName,
      movie: mName,
      amount: t.finalAmount,
      showTime: t.bookingData?.showTime || t.setSeatData?.showTime || t.showTime,
      userPhone: t.userPhone || t.mobileNumber || t.paymentResponse?.contact,
      rzpPaymentId: t.paymentResponse?.razorpay_payment_id || t.paymentResponse?.id,
      refundStatus: t.refundStatus,
      refundId: t.refundId || t.refundData?.id,
      vistaErrorResponse: t.vistaErrorResponse || t.error
    });
  }

  // Let's analyze Status 2 (Payment Failed / Cancelled: 30)
  const status2 = txs.filter(t => t.status === 2);
  console.log(`\n=== STATUS 2 (PAYMENT FAILED / USER CANCELLED): ${status2.length} ===`);
  const status2Cinemas = {};
  const status2Reasons = {};

  for (const t of status2) {
    const cName = cinemaMap[t.cinemaId?.toString()]?.cinemaName || t.cinemaId || 'Unknown Cinema';
    status2Cinemas[cName] = (status2Cinemas[cName] || 0) + 1;
    const reason = t.paymentResponse?.error?.description || t.paymentResponse?.error?.code || t.error || 'Payment Cancelled / Abandoned / Failed';
    status2Reasons[reason] = (status2Reasons[reason] || 0) + 1;
  }
  console.log('Status 2 by Cinema:', status2Cinemas);
  console.log('Status 2 Reasons:', status2Reasons);

  // Let's analyze Status 1 (Success: 51)
  const status1 = txs.filter(t => t.status === 1);
  console.log(`\n=== STATUS 1 (SUCCESSFUL BOOKINGS): ${status1.length} ===`);
  const status1Cinemas = {};
  let totalStatus1Amount = 0;
  for (const t of status1) {
    const cName = cinemaMap[t.cinemaId?.toString()]?.cinemaName || t.cinemaId || 'Unknown Cinema';
    status1Cinemas[cName] = (status1Cinemas[cName] || 0) + 1;
    totalStatus1Amount += t.finalAmount || 0;
  }
  console.log('Status 1 by Cinema:', status1Cinemas);
  console.log('Status 1 Total Revenue: ₹' + totalStatus1Amount);

  await mongoose.disconnect();
}

run();
