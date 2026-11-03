import mongoose from 'mongoose';
import fs from 'fs';

async function run() {
  await mongoose.connect('mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin');
  const db = mongoose.connection.db;

  const cinemas = await db.collection('cinemas').find({}, { projection: { cinemaName: 1, cinemaId: 1 } }).toArray();
  const cinemaMap = {};
  for (const c of cinemas) cinemaMap[c._id.toString()] = c.cinemaName;

  const movies = await db.collection('movies').find({}, { projection: { name: 1 } }).toArray();
  const movieMap = {};
  for (const m of movies) movieMap[m._id.toString()] = m.name;

  const start = new Date('2026-11-03T00:00:00.000+05:30');
  const end = new Date();

  const s4Txs = await db.collection('transactions').find({
    status: 4,
    createdAt: { $gte: start, $lte: end }
  }).sort({ createdAt: 1 }).toArray();

  const headers = [
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
  ];

  const rows = [headers.join(',')];

  for (const t of s4Txs) {
    const timeIST = new Date(t.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    const cName = cinemaMap[t.cinemaId?.toString()] || 'Connplex Cinema';
    const mName = movieMap[t.movieId?.toString()] || 'Movie';
    const seats = t.setSeatData?.strSeatInfo || t.addSeatData?.strSeatInfo || '';
    const seatCount = seats ? seats.split(',').length : 1;
    const amount = Number(t.finalBookingCalculation?.finalAmount) || Number(t.paymentResponse?.amount) || 0;
    const phone = t.paymentResponse?.contact || t.userPhone || '';
    const payId = t.paymentResponse?.razorpay_payment_id || t.paymentResponse?.id || '';
    const orderId = t.paymentResponse?.razorpay_order_id || t.razorpayOrderId || '';

    const row = [
      t.initTransId,
      `"${timeIST}"`,
      `"${cName}"`,
      `"${mName}"`,
      `"${seats}"`,
      seatCount,
      amount,
      `"${phone}"`,
      `"${payId}"`,
      `"${orderId}"`,
      `"3D Glasses Tender Underpayment Mismatch"`
    ];
    rows.push(row.join(','));
  }

  fs.writeFileSync('Connplex_Nov03_2026_Refund_List.csv', rows.join('\n'), 'utf8');
  console.log(`Generated Connplex_Nov03_2026_Refund_List.csv with ${s4Txs.length} records.`);

  await mongoose.disconnect();
}

run();
