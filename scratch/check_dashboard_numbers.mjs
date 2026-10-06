import mongoose from 'mongoose';

async function run() {
  await mongoose.connect('mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin');
  const db = mongoose.connection.db;

  console.log("=== ADMIN DASHBOARD 'TICKET TRANSACTIONS' METRIC ===");
  for (const day of [1, 2, 3, 4, 5, 6]) {
    const start = new Date(`2026-10-0${day}T00:00:00.000+05:30`);
    const end = new Date(`2026-10-0${day}T23:59:59.999+05:30`);

    const successCount = await db.collection('transactions').countDocuments({
      deletedStatus: 0,
      paymentsStatus: true,
      commitStatus: true,
      "commitBookingData.strBookId": { $exists: true, $ne: "" },
      createdAt: { $gte: start, $lte: end },
    });

    const failedCount = await db.collection('transactions').countDocuments({
      deletedStatus: 0,
      paymentsStatus: true, // payment done
      $or: [{ commitStatus: false }, { commitStatus: { $exists: false } }],
      createdAt: { $gte: start, $lte: end },
    });

    const total = successCount + failedCount;
    const failureRate = total > 0 ? ((failedCount / total) * 100).toFixed(2) : 0;
    const successRate = total > 0 ? ((successCount / total) * 100).toFixed(2) : 100;

    console.log(`Date: 0${day}/10/2026`);
    console.log(`  Total: ${total} | Success: ${successCount} | Failed: ${failedCount}`);
    console.log(`  Failure Rate: ${failureRate}% | Success Rate: ${successRate}%\n`);
  }

  // Also check since 4:30 PM today (post deployment)
  const deployTime = new Date('2026-10-06T11:00:00.000Z'); // 4:30 PM IST
  const now = new Date();
  const postSuccess = await db.collection('transactions').countDocuments({
    deletedStatus: 0,
    paymentsStatus: true,
    commitStatus: true,
    "commitBookingData.strBookId": { $exists: true, $ne: "" },
    createdAt: { $gte: deployTime, $lte: now },
  });
  const postFailed = await db.collection('transactions').countDocuments({
    deletedStatus: 0,
    paymentsStatus: true,
    $or: [{ commitStatus: false }, { commitStatus: { $exists: false } }],
    createdAt: { $gte: deployTime, $lte: now },
  });
  console.log(`=== POST-DEPLOYMENT (Since 4:30 PM IST) ===`);
  console.log(`Total: ${postSuccess + postFailed} | Success: ${postSuccess} | Failed: ${postFailed}`);
  console.log(`Failure Rate: ${postSuccess + postFailed > 0 ? ((postFailed / (postSuccess + postFailed)) * 100).toFixed(2) : 0}%`);

  await mongoose.disconnect();
}

run();
