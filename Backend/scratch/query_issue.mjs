import mongoose from 'mongoose';

async function main() {
  try {
    await mongoose.connect('mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin', { serverSelectionTimeoutMS: 5000 });
    const db = mongoose.connection.db;
    const since = new Date('2026-11-15T00:00:00.000Z');
    const txs = await db.collection('transactions')
      .find({ createdAt: { $gte: since }, paymentsStatus: true })
      .sort({ createdAt: -1 })
      .toArray();
    console.log('Found transactions:', txs.length);
    for (const tx of txs) {
      const show = tx.showId ? await db.collection('shows').findOne({ _id: tx.showId }) : null;
      console.log('TX:', tx._id, 'initTransId:', tx.initTransId, 'createdAt:', tx.createdAt, 'paymentsStatus:', tx.paymentsStatus, 'commitStatus:', tx.commitStatus);
      if (show) {
        console.log('  Show:', show._id, 'sessionRealShow:', show.sessionRealShow, 'screenName:', show.screenName);
      }
    }
    await mongoose.disconnect();
  } catch (err) {
    console.error('Error:', err.message);
  }
}

main();
