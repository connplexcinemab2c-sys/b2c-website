import mongoose from 'mongoose';

const MONGO_URL = 'mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin';

async function checkClosed() {
  await mongoose.connect(MONGO_URL);
  const db = mongoose.connection.db;

  const now = new Date();
  const closedShows = await db.collection('shows').find({
    sessionRealShow: { $gte: now },
    screenStatus: 'C',
    deletedStatus: 0
  }).toArray();

  console.log(`Future shows with screenStatus="C": ${closedShows.length}`);
  const byCinema = {};
  closedShows.forEach(s => {
    byCinema[s.cinemaId] = (byCinema[s.cinemaId] || 0) + 1;
  });
  console.log('Breakdown by cinema:', byCinema);

  for (const s of closedShows.slice(0, 5)) {
    console.log(`Sample closed show: cinema=${s.cinemaId}, session=${s.sessionId}, time=${s.sessionRealShow}, seatsAvail=${s.sessionSeatsAvail}`);
  }

  await mongoose.disconnect();
}

checkClosed().catch(console.error);
