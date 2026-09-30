import mongoose from 'mongoose';

async function run() {
  try {
    await mongoose.connect('mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin');
    const db = mongoose.connection.db;

    // 1. Find Pune Tribeca cinema
    const cinemas = await db.collection('cinemas').find({
      $or: [
        { name: /tribeca|pune/i },
        { cinemaName: /tribeca|pune/i }
      ]
    }).toArray();

    console.log("=== CINEMAS FOUND ===");
    for (const c of cinemas) {
      console.log(`Cinema ID: ${c._id} | Code: ${c.cinemaId || c.cinOperatorCode} | Name: ${c.cinemaName || c.name} | City: ${c.city}`);
    }

    const tribecaIds = cinemas.map(c => c._id);
    const tribecaCodes = cinemas.map(c => c.cinemaId).filter(Boolean);

    // 2. Find Avengers movies
    const avengersMovies = await db.collection('movies').find({
      $or: [
        { name: /avenger/i },
        { title: /avenger/i }
      ]
    }).toArray();

    console.log("\n=== AVENGERS MOVIES ===");
    for (const m of avengersMovies) {
      console.log(`Movie ID: ${m._id} | FilmCode: ${m.filmCode} | Name: ${m.name || m.title}`);
    }
    const avengersMovieIds = avengersMovies.map(m => m._id);

    // 3. Find recent bookings for Avengers at Pune Tribeca
    const recentTx = await db.collection('transactions').find({
      cinemaId: { $in: tribecaIds },
      $or: [
        { movieId: { $in: avengersMovieIds } },
        { "movieData.name": /avenger/i }
      ],
      createdAt: { $gte: new Date("2026-09-25T00:00:00.000Z") }
    }).sort({ createdAt: -1 }).toArray();

    console.log(`\n=== RECENT AVENGERS BOOKINGS AT TRIBECA: ${recentTx.length} ===`);
    for (const t of recentTx) {
      console.log("------------------------------------------------");
      console.log(`TxID: ${t._id} | InitTransId: ${t.initTransId} | Status: ${t.status}`);
      console.log(`CreatedAt: ${t.createdAt} (IST: ${new Date(new Date(t.createdAt).getTime() + 5.5*3600*1000).toISOString()})`);
      console.log(`Movie: ${t.movieData?.name}`);
      console.log(`Show ID: ${t.showId}`);
      console.log(`ShowData:`, t.showData);
      console.log(`CommitBookingData:`, t.commitBookingData);
      console.log(`AddSeatData:`, t.addSeatData);
      console.log(`PaymentResponse notes:`, t.paymentResponse?.notes);
    }

    // 4. Find all shows for Avengers at Tribeca (recent or active)
    const shows = await db.collection('shows').find({
      $or: [
        { cinemaObjectId: { $in: tribecaIds } },
        { cinemaId: { $in: tribecaCodes } }
      ],
      filmObjectId: { $in: avengersMovieIds }
    }).sort({ sessionRealShow: -1 }).limit(20).toArray();

    console.log(`\n=== SHOWS FOUND IN 'shows' COLLECTION: ${shows.length} ===`);
    for (const s of shows) {
      console.log({
        _id: s._id,
        sessionId: s.sessionId,
        cinemaId: s.cinemaId,
        screenName: s.screenName,
        sessionRealShow: s.sessionRealShow,
        sessionFinishShow: s.sessionFinishShow,
        sessionRealShowIST: s.sessionRealShow ? new Date(new Date(s.sessionRealShow).getTime() + 5.5*3600*1000).toISOString() : null,
        screenStatus: s.screenStatus,
        isActive: s.isActive,
        deletedStatus: s.deletedStatus,
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
