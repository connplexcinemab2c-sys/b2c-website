import mongoose from 'mongoose';

async function main() {
  await mongoose.connect('mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin');
  const db = mongoose.connection.db;

  const movieId = new mongoose.Types.ObjectId('6ab689191b1734c6bccc4f4e');
  const regionId = '65c1da3d65d1f285d00320d0';
  const showDate = '2026-10-13';

  const movie = await db.collection('movies').findOne({ _id: movieId });
  console.log('Target Movie:', movie.name, '| uniqueFilmCode:', movie.uniqueFilmCode, '| filmCode:', movie.filmCode);

  const moviesByUniqueCode = await db.collection('movies').find({ uniqueFilmCode: movie.uniqueFilmCode, deletedStatus: 0 }).toArray();
  console.log('Movies with same uniqueFilmCode:', moviesByUniqueCode.length);
  const filmCodes = moviesByUniqueCode.map(m => m.filmCode);
  console.log('Sample filmCodes:', filmCodes.slice(0, 5));

  const cinemas = await db.collection('cinemas').find({ deletedStatus: 0, isActive: true }).toArray();
  const cinemaIds = [];
  cinemas.forEach(c => {
    if (c.regionId?.toString() === regionId && c.displayName && c.poster) {
      cinemaIds.push(c._id);
    }
  });
  console.log('CinemaIds in region:', cinemaIds);

  const showsInDb = await db.collection('shows').find({
    cinemaObjectId: { $in: cinemaIds },
    sessionRealShow: {
      $gte: new Date(showDate + 'T00:00:00'),
      $lte: new Date(showDate + 'T23:59:59'),
    },
    screenStatus: { $ne: 'C' },
    isActive: true,
    deletedStatus: 0,
  }).toArray();

  console.log('Total shows for cinema on date:', showsInDb.length);
  for (const s of showsInDb) {
    console.log('  Show in DB:', s.sessionId, '| FilmCode:', s.filmCode, '| RealShow:', s.sessionRealShow);
  }

  // Check if any show's filmCode matches the regexes
  const regexes = filmCodes.filter(Boolean).map(f => new RegExp(f, 'i'));
  const matchedShows = showsInDb.filter(s => regexes.some(r => r.test(s.filmCode)));
  console.log('Matched shows with movie uniqueFilmCode:', matchedShows.length);

  await mongoose.disconnect();
}

main().catch(console.error);
