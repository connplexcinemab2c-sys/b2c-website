import mongoose from 'mongoose';

async function run() {
  try {
    await mongoose.connect('mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin');
    const db = mongoose.connection.db;

    // Pick one confirmed tx: 6aec278331cb02a893732f3d
    const tx = await db.collection('transactions').findOne({ _id: new mongoose.Types.ObjectId('6aec278331cb02a893732f3d') });
    console.log('Transaction keys:', Object.keys(tx));
    console.log('tx.showId:', tx.showId);
    console.log('tx.movieId:', tx.movieId);
    console.log('tx.cinemaId:', tx.cinemaId);
    console.log('tx.showDate / showTime / showData:', tx.showDate, tx.showTime, tx.showData);
    console.log('tx.bookingData:', tx.bookingData);
    console.log('tx.commitBookingData:', tx.commitBookingData);
    console.log('tx.commitBookingResponse:', tx.commitBookingResponse);
    console.log('tx.finalBookingCalculation:', JSON.stringify(tx.finalBookingCalculation, null, 2));

    if (tx.showId) {
      const show = await db.collection('shows').findOne({ _id: tx.showId });
      console.log('Show from db:', show);
    }

    if (tx.userId) {
      const user = await db.collection('users').findOne({ _id: tx.userId });
      console.log('User from db:', user);
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

run();
