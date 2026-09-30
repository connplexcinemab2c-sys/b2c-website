import mongoose from 'mongoose';

async function run() {
  try {
    await mongoose.connect('mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin');
    const db = mongoose.connection.db;

    const shows = await db.collection('shows').find({
      $or: [
        { cinemaId: 'CN39' },
        { cinemaObjectId: new mongoose.Types.ObjectId('69bd5d744c5762dfaf7ace54') }
      ],
      sessionRealShow: {
        $gte: new Date("2026-09-28T00:00:00.000Z"),
        $lte: new Date("2026-10-02T23:59:59.999Z")
      }
    }).sort({ sessionRealShow: 1 }).toArray();

    console.log(`Found ${shows.length} shows for Tribeca between Sept 28 and Oct 2:`);
    for (const s of shows) {
      const movie = await db.collection('movies').findOne({ _id: s.filmObjectId });
      const istTime = new Date(new Date(s.sessionRealShow).getTime() + 5.5 * 3600 * 1000).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
      console.log(`SessionId: ${s.sessionId} | ${istTime} | UTC: ${s.sessionRealShow} | Screen: ${s.screenName} | FilmCode: ${s.filmCode} | Movie: ${movie?.name} | Active: ${s.isActive} | Status: ${s.screenStatus} | Del: ${s.deletedStatus}`);
    }

    // Also let's check TodayShow collection!
    const todayShows = await db.collection('todayshows').find({
      $or: [
        { cinemaId: 'CN39' },
        { cinemaObjectId: new mongoose.Types.ObjectId('69bd5d744c5762dfaf7ace54') }
      ]
    }).toArray();
    console.log(`\nFound ${todayShows.length} shows in todayshows for Tribeca`);
    for (const s of todayShows) {
      const movie = await db.collection('movies').findOne({ _id: s.filmObjectId });
      const istTime = new Date(new Date(s.sessionRealShow).getTime() + 5.5 * 3600 * 1000).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
      console.log(`[TodayShow] SessionId: ${s.sessionId} | ${istTime} | Screen: ${s.screenName} | Movie: ${movie?.name} | Active: ${s.isActive}`);
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

run();
