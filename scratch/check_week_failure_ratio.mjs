import mongoose from 'mongoose';

async function run() {
  await mongoose.connect('mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin');
  const db = mongoose.connection.db;

  // Let's inspect date range:
  // Week start: Monday Oct 26, 2026 00:00:00 IST
  // Now: Oct 31, 2026 ~14:15 IST
  const weekStart = new Date('2026-10-26T00:00:00.000+05:30');
  const now = new Date('2026-10-31T23:59:59.999+05:30'); // through today

  // Also let's check last 7 days (Oct 25 to Oct 31)
  const days = [
    '2026-10-25',
    '2026-10-26',
    '2026-10-27',
    '2026-10-28',
    '2026-10-29',
    '2026-10-30',
    '2026-10-31'
  ];

  console.log('========================================================================');
  console.log('DAILY BREAKDOWN (OCT 25 - OCT 31, 2026)');
  console.log('========================================================================\n');

  for (const dayStr of days) {
    const start = new Date(`${dayStr}T00:00:00.000+05:30`);
    const end = new Date(`${dayStr}T23:59:59.999+05:30`);

    // All transactions created
    const totalCreated = await db.collection('transactions').countDocuments({
      deletedStatus: 0,
      createdAt: { $gte: start, $lte: end }
    });

    // By status
    const statusAgg = await db.collection('transactions').aggregate([
      { $match: { deletedStatus: 0, createdAt: { $gte: start, $lte: end } } },
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]).toArray();

    const statusMap = {};
    for (const s of statusAgg) statusMap[s._id] = s.count;

    // Paid Successful: paymentsStatus=true, commitStatus=true, strBookId exists
    const paidSuccess = await db.collection('transactions').countDocuments({
      deletedStatus: 0,
      paymentsStatus: true,
      commitStatus: true,
      "commitBookingData.strBookId": { $exists: true, $ne: "" },
      createdAt: { $gte: start, $lte: end }
    });

    // Paid Failed: paymentsStatus=true, commitStatus != true
    const paidFailed = await db.collection('transactions').countDocuments({
      deletedStatus: 0,
      paymentsStatus: true,
      $or: [{ commitStatus: false }, { commitStatus: { $exists: false } }],
      createdAt: { $gte: start, $lte: end }
    });

    const paidTotal = paidSuccess + paidFailed;
    const paidFailRate = paidTotal > 0 ? ((paidFailed / paidTotal) * 100).toFixed(2) : '0.00';

    console.log(`Date: ${dayStr} (IST)`);
    console.log(`  Total Created: ${totalCreated}`);
    console.log(`  Statuses: ${JSON.stringify(statusMap)}`);
    console.log(`  Paid Total: ${paidTotal} | Paid Success: ${paidSuccess} | Paid Failed: ${paidFailed}`);
    console.log(`  Paid Booking Failure Ratio: ${paidFailRate}%\n`);
  }

  // Summary for Calendar Week (Mon Oct 26 - Sat Oct 31)
  console.log('========================================================================');
  console.log('SUMMARY FOR CURRENT CALENDAR WEEK (Monday Oct 26 to Saturday Oct 31, 2026)');
  console.log('========================================================================\n');

  const calPaidSuccess = await db.collection('transactions').countDocuments({
    deletedStatus: 0,
    paymentsStatus: true,
    commitStatus: true,
    "commitBookingData.strBookId": { $exists: true, $ne: "" },
    createdAt: { $gte: weekStart, $lte: now }
  });

  const calPaidFailed = await db.collection('transactions').countDocuments({
    deletedStatus: 0,
    paymentsStatus: true,
    $or: [{ commitStatus: false }, { commitStatus: { $exists: false } }],
    createdAt: { $gte: weekStart, $lte: now }
  });

  const calPaidTotal = calPaidSuccess + calPaidFailed;
  const calPaidFailRate = calPaidTotal > 0 ? ((calPaidFailed / calPaidTotal) * 100).toFixed(2) : '0.00';
  const calPaidSuccessRate = calPaidTotal > 0 ? ((calPaidSuccess / calPaidTotal) * 100).toFixed(2) : '100.00';

  console.log(`Total Paid Attempts: ${calPaidTotal}`);
  console.log(`Successful Bookings: ${calPaidSuccess} (${calPaidSuccessRate}%)`);
  console.log(`Failed Bookings (Paid): ${calPaidFailed} (${calPaidFailRate}%)`);

  // Overall status counts for calendar week
  const calStatuses = await db.collection('transactions').aggregate([
    { $match: { deletedStatus: 0, createdAt: { $gte: weekStart, $lte: now } } },
    { $group: { _id: "$status", count: { $sum: 1 } } }
  ]).toArray();

  console.log('\nStatus Breakdown for Calendar Week:');
  for (const s of calStatuses) {
    console.log(`  Status ${s._id}: ${s.count}`);
  }

  // If there are any paid failures (Status 4 or commitStatus false), let's inspect them!
  const failedList = await db.collection('transactions').find({
    deletedStatus: 0,
    paymentsStatus: true,
    $or: [{ commitStatus: false }, { commitStatus: { $exists: false } }],
    createdAt: { $gte: weekStart, $lte: now }
  }).toArray();

  console.log(`\n========================================================================`);
  console.log(`FAILED BOOKING DETAILS (Count: ${failedList.length})`);
  console.log(`========================================================================`);
  for (const f of failedList) {
    console.log({
      id: f._id,
      transId: f.transId || f.initTransId,
      status: f.status,
      paymentsStatus: f.paymentsStatus,
      commitStatus: f.commitStatus,
      finalAmount: f.finalAmount,
      cinema: f.bookingData?.cinemaData?.cinemaName || f.cinemaId,
      createdAt: f.createdAt,
      vistaErrorResponse: f.vistaErrorResponse,
      error: f.error || f.commitBookingData?.error
    });
  }

  // Also check if any refund or status 3
  const refundedList = await db.collection('transactions').find({
    deletedStatus: 0,
    status: 3,
    createdAt: { $gte: weekStart, $lte: now }
  }).toArray();
  console.log(`\nStatus 3 (Refunded) Count: ${refundedList.length}`);

  await mongoose.disconnect();
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
