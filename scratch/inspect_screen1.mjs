import mongoose from 'mongoose';

async function run() {
  try {
    await mongoose.connect('mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin');
    const db = mongoose.connection.db;

    const screen1Shows = await db.collection('shows').find({
      cinemaId: 'CN39',
      screenName: 'SCREEN 1',
      sessionRealShow: {
        $gte: new Date("2026-09-30T00:00:00.000Z"),
        $lte: new Date("2026-10-02T23:59:59.999Z")
      }
    }).sort({ sessionRealShow: 1 }).toArray();

    console.log(`Screen 1 shows at Tribeca (${screen1Shows.length}):`);
    for (const s of screen1Shows) {
      const movie = await db.collection('movies').findOne({ _id: s.filmObjectId });
      console.log({
        sessionId: s.sessionId,
        movie: movie?.name,
        filmCode: s.filmCode,
        sessionRealShow_UTC: s.sessionRealShow.toISOString(),
        sessionFinishShow_UTC: s.sessionFinishShow?.toISOString(),
        // IST = UTC + 5.5 hours
        ist_start: new Date(s.sessionRealShow.getTime() + 5.5*3600*1000).toUTCString().replace('GMT', 'IST'),
        ist_finish: s.sessionFinishShow ? new Date(s.sessionFinishShow.getTime() + 5.5*3600*1000).toUTCString().replace('GMT', 'IST') : null,
        screenStatus: s.screenStatus,
        isActive: s.isActive,
        sessionSeatsAvail: s.sessionSeatsAvail,
        createdAt: s.createdAt,
        updatedAt: s.updatedAt
      });
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

run();
