import mongoose from 'mongoose';

async function run() {
  await mongoose.connect('mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin');
  const db = mongoose.connection.db;

  const start = new Date('2026-10-25T00:00:00.000+05:30');
  const end = new Date('2026-10-31T23:59:59.999+05:30');

  const failedTxs = await db.collection('transactions').find({
    deletedStatus: 0,
    paymentsStatus: true,
    $or: [{ commitStatus: false }, { commitStatus: { $exists: false } }],
    createdAt: { $gte: start, $lte: end }
  }).toArray();

  console.log(`Found ${failedTxs.length} failed paid transactions between Oct 25 and Oct 31:`);

  for (const tx of failedTxs) {
    const cinema = tx.cinemaId ? await db.collection('cinemas').findOne({ _id: tx.cinemaId }) : null;
    const movie = tx.movieId ? await db.collection('movies').findOne({ _id: tx.movieId }) : null;

    console.log('----------------------------------------------------');
    console.log(`ID: ${tx._id}`);
    console.log(`Trans ID: ${tx.transId || tx.initTransId}`);
    console.log(`Date (IST): ${new Date(tx.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`);
    console.log(`Cinema: ${cinema?.cinemaName || tx.cinemaId} (${cinema?.cinemaId})`);
    console.log(`Movie: ${movie?.filmTitle || movie?.filmName || tx.movieId}`);
    console.log(`Final Amount: ₹${tx.finalAmount || tx.paymentResponse?.amount ? (tx.paymentResponse?.amount / 100 || tx.finalAmount) : 'N/A'}`);
    console.log(`Status: ${tx.status}`);
    console.log(`Payments Status: ${tx.paymentsStatus}`);
    console.log(`Commit Status: ${tx.commitStatus}`);
    console.log(`Payment Response Status: ${tx.paymentResponse?.status}`);
    console.log(`Razorpay Payment ID: ${tx.paymentResponse?.razorpay_payment_id || tx.paymentResponse?.id}`);
    console.log(`Refund Status: ${tx.refundStatus}`);
    console.log(`Seats:`, tx.setSeatData?.strSeatInfo || tx.bookingData?.seatInfo);
    console.log(`Vista Error:`, JSON.stringify(tx.vistaErrorResponse || tx.error, null, 2));
  }

  await mongoose.disconnect();
}

run();
