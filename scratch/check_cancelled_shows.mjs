import mongoose from 'mongoose';

async function run() {
  await mongoose.connect('mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin');
  const db = mongoose.connection.db;

  const start = new Date('2026-10-25T00:00:00.000+05:30');
  const now = new Date('2026-10-31T23:59:59.999+05:30');

  console.log("=== Checking shows cancelled this week ===");
  const cancelledShows = await db.collection('shows').find({
    sessionRealShow: { $gte: start, $lte: now },
    screenStatus: "C"
  }).toArray();
  console.log(`Found ${cancelledShows.length} cancelled shows in shows collection`);
  for (const cs of cancelledShows) {
    console.log(`Show ID: ${cs._id}, Cinema: ${cs.cinemaId}, Screen: ${cs.screenName}, Session: ${cs.sessionRealShow}, SessionId: ${cs.sessionId}`);

    // Find any successful bookings for this cancelled show
    const bookingsForShow = await db.collection('transactions').find({
      sessionId: cs.sessionId,
      paymentsStatus: true,
      commitStatus: true
    }).toArray();
    console.log(`  Bookings for this cancelled show: ${bookingsForShow.length}`);
    for (const b of bookingsForShow) {
      console.log(`    Booking ID: ${b.transId}, Phone: ${b.normalized_phone}, Amount: ${b.finalAmount}, Seats: ${b.setSeatData?.strSeatInfo}`);
    }
  }

  // Also check todayshows
  const cancelledTodayShows = await db.collection('todayshows').find({
    sessionRealShow: { $gte: start, $lte: now },
    screenStatus: "C"
  }).toArray();
  console.log(`\nFound ${cancelledTodayShows.length} cancelled shows in todayshows collection`);
  for (const cs of cancelledTodayShows) {
    console.log(`Show ID: ${cs._id}, Cinema: ${cs.cinemaId}, Screen: ${cs.screenName}, Session: ${cs.sessionRealShow}`);
  }

  await mongoose.disconnect();
}

run();
