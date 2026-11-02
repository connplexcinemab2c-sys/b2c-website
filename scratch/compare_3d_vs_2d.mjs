import mongoose from 'mongoose';

async function run() {
  await mongoose.connect('mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin');
  const db = mongoose.connection.db;

  const movies = await db.collection('movies').find({
    name: { $regex: /3D RAMAYANA/i }
  }).toArray();

  console.log(`Found ${movies.length} movies matching '3D RAMAYANA':`);
  const movieIds = movies.map(m => m._id);
  for (const m of movies) {
    console.log(`  - _id: ${m._id}, name: ${m.name}, cinemaId: ${m.cinemaId}, filmCode: ${m.filmCode}`);
  }

  // Count by status for these 3D Ramayana movieIds
  const agg = await db.collection('transactions').aggregate([
    { $match: { movieId: { $in: movieIds } } },
    { $group: { _id: "$status", count: { $sum: 1 } } }
  ]).toArray();

  console.log('\nAll-time Transactions for 3D RAMAYANA by status:');
  console.table(agg);

  // Let's compare the exact Vista request parameters for:
  // 1) Successful RAMAYANA (HINDI) tx: 20000098995
  // 2) Failed 3D RAMAYANA (HINDI) tx: 20000243255
  const successTx = await db.collection('transactions').findOne({ initTransId: '20000098995' });
  const failedTx = await db.collection('transactions').findOne({ initTransId: '20000243255' });

  console.log('\n--- SUCCESS TX (RAMAYANA HINDI) ---');
  console.log('addSeatData:', JSON.stringify(successTx?.addSeatData, null, 2));
  console.log('setSeatData:', JSON.stringify(successTx?.setSeatData, null, 2));
  console.log('finalBookingCalculation:', JSON.stringify(successTx?.finalBookingCalculation, null, 2));

  console.log('\n--- FAILED TX (3D RAMAYANA HINDI) ---');
  console.log('addSeatData:', JSON.stringify(failedTx?.addSeatData, null, 2));
  console.log('setSeatData:', JSON.stringify(failedTx?.setSeatData, null, 2));
  console.log('finalBookingCalculation:', JSON.stringify(failedTx?.finalBookingCalculation, null, 2));

  await mongoose.disconnect();
}

run();
