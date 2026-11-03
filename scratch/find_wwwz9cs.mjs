import mongoose from 'mongoose';

async function run() {
  await mongoose.connect('mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin');
  const db = mongoose.connection.db;

  const target = 'WWWZ9CS';
  console.log(`Searching for strBookId = "${target}" (case-insensitive)...`);

  // 1. Direct query on commitBookingData.strBookId
  const tx1 = await db.collection('transactions').find({
    $or: [
      { 'commitBookingData.strBookId': { $regex: new RegExp(`^${target}$`, 'i') } },
      { 'commitBookingData.strBookIdEx': { $regex: new RegExp(target, 'i') } },
      { 'commitBookingData.strTransId': { $regex: new RegExp(target, 'i') } },
      { 'commitBookingData.strBarcode': { $regex: new RegExp(target, 'i') } }
    ]
  }).toArray();

  console.log(`Found by exact/regex strBookId: ${tx1.length}`);

  if (tx1.length > 0) {
    for (const t of tx1) {
      console.log('Transaction Found:');
      console.log(JSON.stringify(t, null, 2));

      // Resolve cinema, movie, show, user
      if (t.cinemaId) {
        const cinema = await db.collection('cinemas').findOne({ _id: t.cinemaId });
        console.log('\n--- Cinema ---', cinema?.cinemaName, cinema?.city, cinema?.address);
      }
      if (t.movieId) {
        const movie = await db.collection('movies').findOne({ _id: t.movieId });
        console.log('\n--- Movie ---', movie?.name || movie?.title);
      }
      if (t.showId) {
        const show = await db.collection('shows').findOne({ _id: t.showId });
        console.log('\n--- Show ---', show?.showTime, show?.showDate, show?.screenName, show);
      }
      if (t.userId) {
        const user = await db.collection('users').findOne({ _id: t.userId });
        console.log('\n--- User ---', user?.name, user?.email, user?.mobile || user?.phone);
      }
    }
    await mongoose.disconnect();
    return;
  }

  // If not found in commitBookingData.strBookId, let's search anywhere in transactions
  console.log('Searching all collections for WWWZ9CS text...');
  const allTx = await db.collection('transactions').find({
    $text: { $search: target }
  }).toArray().catch(() => []);

  console.log(`Text search results: ${allTx.length}`);

  await mongoose.disconnect();
}

run();
