import mongoose from 'mongoose';

async function run() {
  await mongoose.connect('mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin');
  const db = mongoose.connection.db;

  const tx = await db.collection('transactions').findOne({ _id: new mongoose.Types.ObjectId("6ae9de7b27a16c0f42d2dab4") });

  const cinema = await db.collection('cinemas').findOne({ _id: tx.cinemaId });
  const movie = await db.collection('movies').findOne({ _id: tx.movieId });
  const show = await db.collection('shows').findOne({ _id: tx.showId });
  const user = await db.collection('users').findOne({ _id: tx.userId });

  console.log("=== CINEMA ===");
  console.log(cinema);

  console.log("\n=== MOVIE ===");
  console.log(movie);

  console.log("\n=== SHOW ===");
  console.log(show);

  console.log("\n=== USER ===");
  console.log(user);

  // Check if coupon exists
  const coupon = await db.collection('coupons').findOne({ coupanCode: tx.coupan?.coupanCode });
  console.log("\n=== COUPON ===");
  console.log(coupon);

  await mongoose.disconnect();
}

run();
