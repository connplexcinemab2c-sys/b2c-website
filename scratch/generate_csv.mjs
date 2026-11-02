import mongoose from 'mongoose';
import fs from 'fs';

async function run() {
  await mongoose.connect('mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin');
  const db = mongoose.connection.db;

  const start = new Date('2026-11-01T00:00:00.000+05:30');
  const end = new Date('2026-11-01T23:59:59.999+05:30');

  const cinemas = await db.collection('cinemas').find({}, { projection: { cinemaName: 1, cinemaId: 1 } }).toArray();
  const cinemaMap = {};
  for (const c of cinemas) cinemaMap[c._id.toString()] = c.cinemaName;

  const movies = await db.collection('movies').find({}, { projection: { name: 1 } }).toArray();
  const movieMap = {};
  for (const m of movies) movieMap[m._id.toString()] = m.name;

  const s4Txs = await db.collection('transactions').find({
    status: 4,
    createdAt: { $gte: start, $lte: end }
  }).sort({ createdAt: -1 }).toArray();

  const csvRows = [];
  csvRows.push([
    'Transaction ID',
    'Date & Time (IST)',
    'Cinema Name',
    'Movie Name',
    'Seats',
    'Seat Count',
    'Amount (INR)',
    'Customer Phone',
    'Razorpay Payment ID',
    'Razorpay Order ID',
    'Reason'
  ].join(','));

  for (const t of s4Txs) {
    const cName = `"${cinemaMap[t.cinemaId?.toString()] || t.cinemaId || ''}"`;
    const mName = `"${movieMap[t.movieId?.toString()] || t.movieId || ''}"`;
    const seats = `"${t.setSeatData?.strSeatInfo || t.addSeatData?.strSeatInfo || ''}"`;
    const seatCount = (t.setSeatData?.strSeatInfo || t.addSeatData?.strSeatInfo || '').split(',').length || 1;
    const amt = t.finalBookingCalculation?.finalAmount || t.paymentResponse?.amount || 0;
    const timeIST = `"${new Date(t.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}"`;
    const phone = `"${t.paymentResponse?.contact || t.userPhone || ''}"`;
    const rzpPayId = `"${t.paymentResponse?.razorpay_payment_id || t.paymentResponse?.id || ''}"`;
    const rzpOrderId = `"${t.paymentResponse?.order_id || t.razorpayOrderId || ''}"`;
    const reason = t.initTransId === '20000069461' ? '"POS Database Error at Cinema"' : '"3D Glasses Tender Underpayment Mismatch"';

    csvRows.push([
      t.initTransId,
      timeIST,
      cName,
      mName,
      seats,
      seatCount,
      amt,
      phone,
      rzpPayId,
      rzpOrderId,
      reason
    ].join(','));
  }

  const csvContent = csvRows.join('\n');
  fs.writeFileSync('Connplex_Nov01_2026_Refund_List.csv', csvContent, 'utf8');
  console.log(`Generated Connplex_Nov01_2026_Refund_List.csv with ${s4Txs.length} records.`);

  await mongoose.disconnect();
}

run();
