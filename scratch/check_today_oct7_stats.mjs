import mongoose from 'mongoose';

async function run() {
  await mongoose.connect('mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin');
  const db = mongoose.connection.db;

  const start = new Date('2026-10-07T00:00:00.000+05:30'); // Start of today (IST)
  const end = new Date('2026-10-07T23:59:59.999+05:30');   // End of today

  console.log(`Querying today's transactions (07/10/2026 IST)...\n`);

  const txs = await db.collection('transactions').find({
    deletedStatus: 0,
    createdAt: { $gte: start, $lte: end }
  }).sort({ createdAt: 1 }).toArray();

  console.log(`Total transactions created today: ${txs.length}`);

  const statusCounts = {};
  for (const t of txs) {
    statusCounts[t.status] = (statusCounts[t.status] || 0) + 1;
  }
  console.log(`Status breakdown:`, statusCounts);

  const status1 = statusCounts[1] || 0;
  const status3 = statusCounts[3] || 0;
  const status4 = statusCounts[4] || 0;
  const status5 = statusCounts[5] || 0;
  const status0 = statusCounts[0] || 0;

  // Metric 1: Admin Dashboard Paid Bookings Metric
  const dashboardSuccess = await db.collection('transactions').countDocuments({
    deletedStatus: 0,
    paymentsStatus: true,
    commitStatus: true,
    "commitBookingData.strBookId": { $exists: true, $ne: "" },
    createdAt: { $gte: start, $lte: end },
  });

  const dashboardFailed = await db.collection('transactions').countDocuments({
    deletedStatus: 0,
    paymentsStatus: true,
    $or: [{ commitStatus: false }, { commitStatus: { $exists: false } }],
    createdAt: { $gte: start, $lte: end },
  });

  const dashboardTotal = dashboardSuccess + dashboardFailed;
  console.log(`\n======================================================`);
  console.log(`METRIC 1: PAID BOOKINGS FAILURE RATIO (Admin Dashboard)`);
  console.log(`======================================================`);
  console.log(`Total Paid Bookings: ${dashboardTotal}`);
  console.log(`Successful Bookings: ${dashboardSuccess}`);
  console.log(`Failed Bookings (Status 4): ${dashboardFailed}`);
  if (dashboardTotal > 0) {
    console.log(`Failure Rate: ${((dashboardFailed / dashboardTotal) * 100).toFixed(2)}%`);
    console.log(`Success Rate: ${((dashboardSuccess / dashboardTotal) * 100).toFixed(2)}%`);
  }

  // Metric 2: Overall Decided Checkout Attempts (including Status 5 drop-offs)
  const totalDecided = status1 + status4 + status5 + status3;
  console.log(`\n======================================================`);
  console.log(`METRIC 2: OVERALL CHECKOUT ATTEMPTS (Including Gateway Drops)`);
  console.log(`======================================================`);
  console.log(`Total Decided Checkouts: ${totalDecided}`);
  console.log(`Successful (Status 1): ${status1}`);
  console.log(`Failed at Gateway (Status 5): ${status5}`);
  console.log(`Failed at Vista (Status 4): ${status4}`);
  if (totalDecided > 0) {
    console.log(`Total Failure Rate: ${(((status4 + status5) / totalDecided) * 100).toFixed(2)}%`);
    console.log(`Success Rate: ${((status1 / totalDecided) * 100).toFixed(2)}%`);
  }

  // Inspect any Status 4 or Status 5 from today
  console.log(`\n--- ALL DECIDED TRANSACTIONS TODAY ---`);
  const decidedList = txs.filter(t => [1, 3, 4, 5].includes(t.status));
  for (const d of decidedList) {
    const timeIST = new Date(d.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    const cinema = d.bookingData?.cinemaData?.cinemaName || d.cinemaId || 'N/A';
    const amount = d.paymentResponse?.amount || d.finalBookingCalculation?.finalAmount || 'N/A';
    console.log(`[${timeIST}] Status ${d.status} | TransID: ${d.transId || d.initTransId} | Cinema: ${cinema} | Amount: ₹${amount} | Commit: ${d.commitStatus}`);
  }

  await mongoose.disconnect();
}

run();
