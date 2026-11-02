import mongoose from 'mongoose';

async function run() {
  await mongoose.connect('mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin');
  const db = mongoose.connection.db;

  const show = await db.collection('shows').findOne({ _id: new mongoose.Types.ObjectId('6ae6db37c06d33726af9fa08') });
  console.log('Show:', show ? {
    _id: show._id,
    filmName: show.filmName,
    filmCode: show.filmCode,
    sessionId: show.sessionId,
    showDate: show.showDate,
    showTime: show.showTime,
    cinemaId: show.cinemaId
  } : 'Not found');

  const cinema = await db.collection('cinemas').findOne({ _id: new mongoose.Types.ObjectId('6ae46ffb443f237d1969d6a3') });
  console.log('Cinema:', cinema ? {
    _id: cinema._id,
    cinemaCode: cinema.cinemaCode,
    cinemaId: cinema.cinemaId,
    name: cinema.cinemaName || cinema.name,
    vistaUrl: cinema.vistaUrl,
    cinemaWebServiceUrl: cinema.cinemaWebServiceUrl
  } : 'Not found');

  await mongoose.disconnect();
}

run().catch(console.error);
