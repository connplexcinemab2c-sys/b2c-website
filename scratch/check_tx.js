const mongoose = require('mongoose');

async function check() {
  try {
    await mongoose.connect('mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin');
    const db = mongoose.connection.db;
    const recent = await db.collection('transactions')
      .find({ addSeatData: { $exists: true, $ne: null } })
      .sort({ _id: -1 })
      .limit(5)
      .toArray();

    console.log('Found', recent.length, 'transactions');
    for (const t of recent) {
      console.log('----------------------------------------');
      console.log('ID:', t._id);
      console.log('initTransId:', t.initTransId);
      console.log('tTypeCode:', t.tTypeCode);
      console.log('addSeatData:', JSON.stringify(t.addSeatData, null, 2));
      console.log('setSeatData:', JSON.stringify(t.setSeatData, null, 2));
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await mongoose.disconnect();
  }
}

check();
