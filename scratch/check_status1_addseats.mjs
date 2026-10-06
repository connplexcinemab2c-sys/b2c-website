import mongoose from 'mongoose';

async function run() {
  try {
    await mongoose.connect('mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin');
    const db = mongoose.connection.db;

    const start = new Date('2026-10-01T00:00:00.000+05:30');
    const end = new Date('2026-10-04T23:59:59.999+05:30');

    const status1Txs = await db.collection('transactions').find({
      deletedStatus: 0,
      createdAt: { $gte: start, $lte: end },
      status: 1
    }).toArray();

    let nonZeroException = 0;
    let zeroException = 0;
    let missingAddSeat = 0;
    const exMap = {};

    for (const t of status1Txs) {
      if (!t.addSeatData) {
        missingAddSeat++;
        continue;
      }
      const ex = t.addSeatData.intException;
      if (ex === undefined || ex === null || ex === 0) {
        zeroException++;
      } else {
        nonZeroException++;
        exMap[ex] = (exMap[ex] || 0) + 1;
      }
    }

    console.log(`Status 1 (Success) total: ${status1Txs.length}`);
    console.log(`addSeatData.intException === 0: ${zeroException}`);
    console.log(`addSeatData.intException !== 0: ${nonZeroException}`);
    console.log(`Missing addSeatData: ${missingAddSeat}`);
    console.log(`Exception breakdown:`, exMap);

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

run();
