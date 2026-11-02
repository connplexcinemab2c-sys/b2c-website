import mongoose from 'mongoose';

async function run() {
  try {
    await mongoose.connect('mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin');
    console.log('Connected to MongoDB');
    const db = mongoose.connection.db;

    const start = new Date('2026-11-01T00:00:00.000+05:30');
    const end = new Date('2026-11-01T23:59:59.999+05:30');

    // Check all transactions on 2026-11-01
    const totalCreated = await db.collection('transactions').countDocuments({
      createdAt: { $gte: start, $lte: end }
    });
    console.log('Total Created on 01/11/2026:', totalCreated);

    const deletedStatus0 = await db.collection('transactions').countDocuments({
      deletedStatus: 0,
      createdAt: { $gte: start, $lte: end }
    });
    console.log('Non-deleted (deletedStatus: 0):', deletedStatus0);

    // Status aggregation
    const statusAgg = await db.collection('transactions').aggregate([
      { $match: { createdAt: { $gte: start, $lte: end } } },
      { $group: { _id: { status: "$status", paymentsStatus: "$paymentsStatus", commitStatus: "$commitStatus" }, count: { $sum: 1 } } }
    ]).toArray();
    console.log('\nStatus Breakdown:');
    console.table(statusAgg.map(s => ({ ...s._id, count: s.count })));

    // Look at paid transactions
    const paidTxs = await db.collection('transactions').find({
      paymentsStatus: true,
      createdAt: { $gte: start, $lte: end }
    }).toArray();
    console.log(`\nTotal paymentsStatus: true count = ${paidTxs.length}`);

    // Commit status distribution for paid transactions
    const paidSuccess = paidTxs.filter(t => t.commitStatus === true && t.commitBookingData?.strBookId);
    const paidFailed = paidTxs.filter(t => !(t.commitStatus === true && t.commitBookingData?.strBookId));
    console.log(`Paid Success: ${paidSuccess.length}, Paid Failed: ${paidFailed.length}`);

    // If paid count matches user's 114:
    // Total bookings: 114, Failed: 63, Successful: 51
    console.log(`Total Bookings user reported: 114 (Successful: 51, Failed: 63)`);

    // Let's also check if user defines bookings differently (e.g. status != 0, or paymentsStatus == true)
    const statusNot0 = await db.collection('transactions').countDocuments({
      status: { $ne: 0 },
      createdAt: { $gte: start, $lte: end }
    });
    console.log('Count where status != 0:', statusNot0);

    await mongoose.disconnect();
  } catch (err) {
    console.error('Error:', err);
  }
}

run();
