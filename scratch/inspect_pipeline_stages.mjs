import mongoose from 'mongoose';

async function main() {
  await mongoose.connect('mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin');
  const db = mongoose.connection.db;

  const movieId = new mongoose.Types.ObjectId('6ab689191b1734c6bccc4f4e');
  const regionId = '65c1da3d65d1f285d00320d0';
  const showDate = '2026-10-13';

  const movie = await db.collection('movies').findOne({ _id: movieId });
  const uniqueCode = movie.uniqueFilmCode;

  const moviesByUniqueCode = await db.collection('movies').find({ uniqueFilmCode: uniqueCode, deletedStatus: 0 }).toArray();
  const filmCodes = moviesByUniqueCode.map(m => m.filmCode).filter(Boolean).map(f => new RegExp(f, 'i'));

  const cinemas = await db.collection('cinemas').find({ deletedStatus: 0, isActive: true }).toArray();
  const cinemaIds = [];
  cinemas.forEach(c => {
    if (c.regionId?.toString() === regionId && c.displayName && c.poster) {
      cinemaIds.push(c._id);
    }
  });

  const matchstage = {
    cinemaObjectId: { $in: cinemaIds },
    sessionRealShow: {
      $gte: new Date(`${showDate}T00:00:00`),
      $lte: new Date(`${showDate}T23:59:59`),
    },
    screenStatus: { $ne: 'C' },
    isActive: true,
    deletedStatus: 0,
    filmCode: { $in: filmCodes },
  };

  const shows = await db.collection('shows').find(matchstage).toArray();
  console.log('Stage 1 - Matched shows count:', shows.length);
  for (const s of shows) {
    console.log(`  Session: ${s.sessionId} | RealShow: ${s.sessionRealShow.toISOString()} | pGroupCode: ${s.pGroupCode} | cinemaId: ${s.cinemaId}`);
    
    // Check price
    const price = await db.collection('prices').findOne({ pGroupCode: s.pGroupCode, cinemaId: s.cinemaId });
    console.log(`    Price record exists? ${!!price} (areaCatCode: ${price?.areaCatCode}, price: ${price?.currentPrice})`);

    // Check SeatFilter
    const seat = await db.collection('sessionareacounts').findOne({ sessionId: s.sessionId });
    console.log(`    SessionAreaCount exists? ${!!seat} (seatsTotal: ${seat?.seatsTotal}, seatsAvail: ${seat?.seatsAvail})`);
  }

  await mongoose.disconnect();
}

main().catch(console.error);
