import mongoose from 'mongoose';
import fs from 'fs';

async function run() {
  await mongoose.connect('mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin');
  const db = mongoose.connection.db;

  const start = new Date('2026-10-25T00:00:00.000+05:30');
  const now = new Date('2026-10-31T23:59:59.999+05:30');

  // 1. Check all transactions where status in [2, 3, 4, 7] or cancellationStatus=true or refundStatus=true this week
  const changedTxs = await db.collection('transactions').find({
    updatedAt: { $gte: start, $lte: now }
  }).toArray();
  console.log(`Transactions updated this week: ${changedTxs.length}`);

  const statusCounts = {};
  for (const t of changedTxs) {
    statusCounts[t.status] = (statusCounts[t.status] || 0) + 1;
  }
  console.log('Status counts of updated transactions:', statusCounts);

  // Check any transaction with cancellationStatus=true or refundStatus=true in the whole DB
  const allCancelledOrRefunded = await db.collection('transactions').find({
    $or: [
      { cancellationStatus: true },
      { refundStatus: true },
      { status: { $in: [3, 7] } }
    ]
  }).toArray();
  console.log(`Total transactions in entire DB with cancellationStatus/refundStatus/status 3,7: ${allCancelledOrRefunded.length}`);
  for (const t of allCancelledOrRefunded) {
    console.log({
      id: t._id,
      transId: t.transId || t.initTransId,
      status: t.status,
      cancellationStatus: t.cancellationStatus,
      refundStatus: t.refundStatus,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
      amount: t.finalAmount
    });
  }

  // Check the undercharged audit CSV transactions
  const csvContent = fs.readFileSync('c:/Users/admin/Downloads/Connplex-B2C/Connplex_Undercharged_Bookings_Audit.csv', 'utf8');
  const lines = csvContent.split('\n').filter(Boolean);
  const transIds = [];
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(',');
    if (parts[0]) {
      transIds.push(parts[0].replace(/"/g, '').trim());
    }
  }
  console.log(`\nChecking ${transIds.length} undercharged transaction IDs in DB...`);
  const underchargedTxsInDb = await db.collection('transactions').find({
    initTransId: { $in: transIds }
  }).toArray();

  const ucStatuses = {};
  for (const t of underchargedTxsInDb) {
    ucStatuses[t.status] = (ucStatuses[t.status] || 0) + 1;
    if (t.status !== 1 || t.cancellationStatus || t.refundStatus) {
      console.log('Non-status 1 undercharged tx:', t.initTransId, 'status:', t.status, 'cancelled:', t.cancellationStatus, 'refunded:', t.refundStatus);
    }
  }
  console.log('Undercharged transactions statuses in DB:', ucStatuses);

  // Check if any deleted transactions exist (deletedStatus: 1)
  const deletedThisWeek = await db.collection('transactions').find({
    deletedStatus: 1,
    updatedAt: { $gte: start, $lte: now }
  }).toArray();
  console.log(`\nDeleted transactions this week: ${deletedThisWeek.length}`);

  await mongoose.disconnect();
}

run();
