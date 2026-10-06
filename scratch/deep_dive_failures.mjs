import mongoose from 'mongoose';

async function run() {
  try {
    await mongoose.connect('mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin');
    const db = mongoose.connection.db;

    const start = new Date('2026-10-01T00:00:00.000+05:30');
    const end = new Date('2026-10-04T23:59:59.999+05:30');

    // Fetch all transactions in Oct 1-4 with status in [1, 4, 5, 6] or where paymentStatus=true
    const txs = await db.collection('transactions').find({
      deletedStatus: 0,
      createdAt: { $gte: start, $lte: end },
      $or: [
        { status: { $in: [1, 4, 5, 6] } },
        { paymentsStatus: true }
      ]
    }).toArray();

    console.log(`Total transactions fetched: ${txs.length}`);

    // Group by status
    const statusCounts = {};
    for (const t of txs) {
      statusCounts[t.status] = (statusCounts[t.status] || 0) + 1;
    }
    console.log('\n=== Status Counts (Total) ===', statusCounts);

    // Group by Day and Status
    const byDay = {};
    for (const t of txs) {
      // IST date string
      const d = new Date(t.createdAt.getTime() + (5.5 * 3600 * 1000)).toISOString().split('T')[0];
      if (!byDay[d]) byDay[d] = { total: 0, success: 0, failed_status4: 0, failed_status5: 0, failed_status6: 0, other: 0 };
      byDay[d].total++;
      if (t.status === 1) byDay[d].success++;
      else if (t.status === 4) byDay[d].failed_status4++;
      else if (t.status === 5) byDay[d].failed_status5++;
      else if (t.status === 6) byDay[d].failed_status6++;
      else byDay[d].other++;
    }
    console.log('\n=== Breakdown by Day ===');
    console.table(byDay);

    // Let's inspect Status 4 (Payment done, booking failed) and Status 6
    const status4And6 = txs.filter(t => t.status === 4 || t.status === 6);
    console.log(`\n=== Total Status 4 & 6 transactions: ${status4And6.length} ===`);

    // Group Status 4 & 6 by Cinema
    const cinemaMap = {};
    const cinemas = await db.collection('cinemas').find({}).toArray();
    for (const c of cinemas) {
      cinemaMap[c._id.toString()] = c.name || c.cinemaName;
    }

    const failedByCinema = {};
    const failedByReason = {};
    for (const t of status4And6) {
      const cName = cinemaMap[t.cinemaId?.toString()] || t.cinemaData?.name || t.cinemaData?.cinemaName || 'Unknown Cinema';
      failedByCinema[cName] = (failedByCinema[cName] || 0) + 1;

      // Extract failure reason
      let reason = 'Unknown';
      if (t.vistaErrorResponse) {
        reason = JSON.stringify(t.vistaErrorResponse);
      } else if (t.logs?.vistaError) {
        reason = JSON.stringify(t.logs.vistaError);
      } else if (t.logs?.error) {
        reason = JSON.stringify(t.logs.error);
      } else if (t.commitBookingData?.error) {
        reason = JSON.stringify(t.commitBookingData.error);
      } else {
        reason = `No explicit error logged (status=${t.status}, commitStatus=${t.commitStatus})`;
      }
      failedByReason[reason] = (failedByReason[reason] || 0) + 1;
    }

    console.log('\n=== Status 4 & 6 Failures by Cinema ===');
    console.table(failedByCinema);

    console.log('\n=== Status 4 & 6 Failure Reasons ===');
    for (const [r, count] of Object.entries(failedByReason)) {
      console.log(`[Count: ${count}] -> ${r.substring(0, 300)}`);
    }

    // Now let's inspect Status 5 (Payment Failed)
    const status5 = txs.filter(t => t.status === 5);
    console.log(`\n=== Total Status 5 transactions: ${status5.length} ===`);
    const status5Reasons = {};
    const status5ByCinema = {};
    for (const t of status5) {
      const cName = cinemaMap[t.cinemaId?.toString()] || 'Unknown Cinema';
      status5ByCinema[cName] = (status5ByCinema[cName] || 0) + 1;

      let err = t.paymentResponse?.error?.description || 
                t.paymentResponse?.error_description || 
                t.paymentResponse?.error?.code || 
                t.paymentResponse?.error?.reason || 
                t.paymentResponse?.message ||
                (t.paymentResponse ? JSON.stringify(t.paymentResponse).substring(0, 100) : 'No paymentResponse');
      status5Reasons[err] = (status5Reasons[err] || 0) + 1;
    }

    console.log('\n=== Status 5 by Cinema ===');
    console.table(status5ByCinema);

    console.log('\n=== Status 5 Failure Reasons ===');
    for (const [r, count] of Object.entries(status5Reasons)) {
      console.log(`[Count: ${count}] -> ${r}`);
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

run();
