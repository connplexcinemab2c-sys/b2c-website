const mongoose = require('mongoose');
const fs = require('fs');

const uri = 'mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin';
const targetIds = ['20000144987', '20000190161', '20000237010', '20000190499'];

async function inspect() {
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 15000 });
  const db = mongoose.connection.db;

  const results = [];
  for (const id of targetIds) {
    const tx = await db.collection('transactions').findOne({
      $or: [
        { initTransId: id },
        { initTransId: Number(id) },
        { transId: id },
        { transId: Number(id) }
      ]
    });
    if (tx) {
      // Lookup movie
      let movie = null;
      if (tx.movieId) {
        movie = await db.collection('movies').findOne({ _id: new mongoose.Types.ObjectId(tx.movieId) });
      }
      // Lookup cinema
      let cinema = null;
      if (tx.cinemaId) {
        cinema = await db.collection('cinemas').findOne({ _id: new mongoose.Types.ObjectId(tx.cinemaId) });
      }
      // Lookup user
      let user = null;
      if (tx.userId) {
        user = await db.collection('users').findOne({ _id: new mongoose.Types.ObjectId(tx.userId) });
      }
      results.push({
        id,
        tx,
        movie,
        cinema,
        user
      });
    } else {
      results.push({ id, notFound: true });
    }
  }

  fs.writeFileSync('scratch/inspected_txs.json', JSON.stringify(results, null, 2));
  console.log('Saved inspection data to scratch/inspected_txs.json');
  process.exit(0);
}

inspect().catch(err => {
  console.error(err);
  process.exit(1);
});
