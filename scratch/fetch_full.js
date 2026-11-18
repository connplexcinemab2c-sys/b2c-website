const mongoose = require('mongoose');
const fs = require('fs');

const uri = 'mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin';
const targetIds = ['20000144987', '20000190161', '20000237010', '20000190499'];

async function fetchFullData() {
  await mongoose.connect(uri);
  const db = mongoose.connection.db;

  const results = [];

  for (const id of targetIds) {
    const tx = await db.collection('transactions').findOne({ initTransId: id });
    if (!tx) continue;

    // movie
    let movie = null;
    if (tx.movieId) {
      movie = await db.collection('movies').findOne({ _id: new mongoose.Types.ObjectId(tx.movieId) });
    }

    // cinema
    let cinema = null;
    let region = null;
    if (tx.cinemaId) {
      cinema = await db.collection('cinemas').findOne({ _id: new mongoose.Types.ObjectId(tx.cinemaId) });
      if (cinema && cinema.regionId) {
        region = await db.collection('regions').findOne({ _id: new mongoose.Types.ObjectId(cinema.regionId) });
      }
    }

    // show
    let show = null;
    if (tx.showId) {
      show = await db.collection('shows').findOne({ _id: new mongoose.Types.ObjectId(tx.showId) });
      if (!show) {
        show = await db.collection('todayshows').findOne({ _id: new mongoose.Types.ObjectId(tx.showId) });
      }
    }

    // user
    let user = null;
    if (tx.userId) {
      user = await db.collection('users').findOne({ _id: new mongoose.Types.ObjectId(tx.userId) });
    }

    results.push({
      initTransId: id,
      tx,
      movie,
      cinema,
      region,
      show,
      user
    });
  }

  fs.writeFileSync('scratch/full_details.json', JSON.stringify(results, null, 2));
  console.log('Saved scratch/full_details.json with count:', results.length);
  process.exit(0);
}

fetchFullData().catch(e => { console.error(e); process.exit(1); });
