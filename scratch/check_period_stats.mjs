import mongoose from 'mongoose';

async function run() {
  await mongoose.connect('mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin');
  const db = mongoose.connection.db;

  const start = new Date('2026-10-06T17:00:00.000+05:30'); // 5:00 PM IST on Oct 6, 2026
  const end = new Date('2026-10-07T14:40:00.000+05:30');   // Current time on Oct 7, 2026

  console.log(`Checking transactions from: ${start.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} to ${end.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}\n`);

  const txs = await db.collection('transactions').find({
    deletedStatus: 0,
    createdAt: { $gte: start, $lte: end }
  }).sort({ createdAt: 1 }).toArray();

  console.log(`Total transaction documents created in this period: ${txs.length}`);

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

  console.log(`\nDetailed breakdown:`);
  console.log(`- Successful Bookings (Status 1): ${status1}`);
  console.log(`- Paid but Booking Failed (Status 4): ${status4}`);
  console.log(`- Gateway Drop-offs / Cancelled (Status 5): ${status5}`);
  console.log(`- Auto-Refunded (Status 3): ${status3}`);
  console.log(`- Browsing / Initiated only (Status 0): ${status0}`);

  // Formula 1: Admin Dashboard Metric (Ticket Success vs Ticket Failed)
  // ticketSuccessCount: paymentsStatus=true, commitStatus=true, strBookId exists
  // ticketFailedCount: paymentsStatus=true, commitStatus != true
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
  console.log(`METRIC 1: PAID BOOKINGS FAILURE RATE (Admin Dashboard)`);
  console.log(`======================================================`);
  console.log(`Total Paid Bookings: ${dashboardTotal}`);
  console.log(`Successful: ${dashboardSuccess}`);
  console.log(`Failed (Status 4): ${dashboardFailed}`);
  if (dashboardTotal > 0) {
    console.log(`Failure Rate: ${((dashboardFailed / dashboardTotal) * 100).toFixed(2)}%`);
    console.log(`Success Rate: ${((dashboardSuccess / dashboardTotal) * 100).toFixed(2)}%`);
  }

  // Formula 2: Overall Decided Checkout Attempts (Status 1 + Status 4 + Status 5)
  const totalDecided = status1 + status4 + status5 + status3;
  console.log(`\n======================================================`);
  console.log(`METRIC 2: OVERALL CHECKOUT ATTEMPTS (Including Gateway Drops)`);
  console.log(`======================================================`);
  console.log(`Total Decided Checkouts: ${totalDecided}`);
  console.log(`Successful: ${status1}`);
  console.log(`Failed at Gateway (Status 5): ${status5}`);
  console.log(`Failed at Vista (Status 4): ${status4}`);
  if (totalDecided > 0) {
    console.log(`Total Failure Rate: ${(((status4 + status5) / totalDecided) * 100).toFixed(2)}%`);
    console.log(`Success Rate: ${((status1 / totalDecided) * 100).toFixed(2)}%`);
  }

  // Inspect any Status 4 if any exist
  if (status4 > 0) {
    console.log(`\n--- DETAILS OF STATUS 4 FAILURES ---`);
    const s4List = txs.filter(t => t.status === 4);
    for (const s of s4List) {
      console.log(`TransID: ${s.transId || s.initTransId} | Cinema: ${s.bookingData?.cinemaData?.cinemaName || s.cinemaId} | VistaError:`, s.vistaErrorResponse);
    }
  }

  await mongoose.disconnect();
}

run();
