import mongoose from 'mongoose';

async function run() {
  try {
    await mongoose.connect('mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin');
    const db = mongoose.connection.db;

    // Check all shows for CN39
    const allShowsCN39 = await db.collection('shows').find({ cinemaId: 'CN39' }).toArray();
    console.log(`Total shows for CN39: ${allShowsCN39.length}`);

    // Check if any show has 18:40 (06:40 PM) in IST (which would be 13:10:00 UTC)
    // Or if any show has 18:40:00 in UTC (which would be 00:10 IST)
    const matches = [];
    for (const s of allShowsCN39) {
      const istTime = new Date(new Date(s.sessionRealShow).getTime() + 5.5*3600*1000).toISOString();
      const utcTime = new Date(s.sessionRealShow).toISOString();
      if (istTime.includes('18:40') || utcTime.includes('18:40') || istTime.includes('06:40') || utcTime.includes('06:40')) {
        matches.push({
          sessionId: s.sessionId,
          screen: s.screenName,
          filmCode: s.filmCode,
          istTime,
          utcTime,
          isActive: s.isActive,
          deletedStatus: s.deletedStatus,
          createdAt: s.createdAt,
          updatedAt: s.updatedAt
        });
      }
    }

    console.log(`Shows at CN39 matching 18:40 / 06:40: ${matches.length}`);
    console.log(matches);

    // Also check ALL cinemas for any Avengers show at 18:40 / 06:40 PM IST
    const avengersShows = await db.collection('shows').find({
      filmCode: /1356/
    }).toArray();
    console.log(`\nTotal Avengers shows across ALL cinemas: ${avengersShows.length}`);
    for (const s of avengersShows) {
      const istTime = new Date(new Date(s.sessionRealShow).getTime() + 5.5*3600*1000).toISOString();
      if (istTime.includes('18:40') || s.sessionRealShow.toISOString().includes('18:40')) {
        const c = await db.collection('cinemas').findOne({ cinemaId: s.cinemaId });
        console.log(`Avengers show at 18:40: Cinema: ${c?.cinemaName} (${s.cinemaId}), Session: ${s.sessionId}, IST: ${istTime}`);
      }
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

run();
