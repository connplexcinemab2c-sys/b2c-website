import mongoose from 'mongoose';

async function run() {
  try {
    await mongoose.connect('mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin');
    const db = mongoose.connection.db;

    const shows = await db.collection('shows').find({
      cinemaId: 'CN39',
      sessionRealShow: {
        $gte: new Date("2026-09-30T00:00:00.000Z"),
        $lte: new Date("2026-10-02T23:59:59.999Z")
      }
    }).sort({ screenName: 1, sessionRealShow: 1 }).toArray();

    console.log(`=== ALL SHOWS AT TRIBECA PUNE (CN39) [${shows.length} shows] ===`);
    for (const s of shows) {
      const movie = await db.collection('movies').findOne({ _id: s.filmObjectId });
      const istStart = new Date(new Date(s.sessionRealShow).getTime() + 5.5 * 3600 * 1000).toISOString().replace('T', ' ').substring(0, 19);
      const istFinish = s.sessionFinishShow ? new Date(new Date(s.sessionFinishShow).getTime() + 5.5 * 3600 * 1000).toISOString().replace('T', ' ').substring(0, 19) : '-';
      console.log(`[${s.screenName}] SessionId: ${s.sessionId} | Start IST: ${istStart} | Finish IST: ${istFinish} | Movie: ${movie?.name} | Active: ${s.isActive} | Avail: ${s.sessionSeatsAvail}`);
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

run();
