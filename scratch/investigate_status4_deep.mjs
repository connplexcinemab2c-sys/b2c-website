import mongoose from 'mongoose';

async function run() {
  try {
    await mongoose.connect('mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin');
    const db = mongoose.connection.db;

    const start = new Date('2026-10-01T00:00:00.000+05:30');
    const end = new Date('2026-10-04T23:59:59.999+05:30');

    const status4Txs = await db.collection('transactions').find({
      deletedStatus: 0,
      createdAt: { $gte: start, $lte: end },
      status: 4
    }).toArray();

    // Fetch movies & cinemas
    const movieIds = [...new Set(status4Txs.map(t => t.movieId?.toString()).filter(Boolean))];
    const cinemaIds = [...new Set(status4Txs.map(t => t.cinemaId?.toString()).filter(Boolean))];

    const movies = await db.collection('movies').find({
      _id: { $in: movieIds.map(id => new mongoose.Types.ObjectId(id)) }
    }).toArray();
    const movieMap = {};
    for (const m of movies) movieMap[m._id.toString()] = m.name || m.title;

    const cinemas = await db.collection('cinemas').find({
      _id: { $in: cinemaIds.map(id => new mongoose.Types.ObjectId(id)) }
    }).toArray();
    const cinemaMap = {};
    for (const c of cinemas) cinemaMap[c._id.toString()] = c.cinemaName;

    console.log(`=== Inspecting ${status4Txs.length} Status 4 Transactions ===\n`);

    // Group by Cinema and Movie
    const grouped = {};
    for (const t of status4Txs) {
      const c = cinemaMap[t.cinemaId?.toString()] || 'Unknown Cinema';
      const m = movieMap[t.movieId?.toString()] || 'Unknown Movie';
      const key = `${c} | ${m}`;
      if (!grouped[key]) grouped[key] = { count: 0, sessions: new Set(), dates: new Set(), sampleTxs: [] };
      grouped[key].count++;
      
      const sessId = t.paymentResponse?.notes?.sessionId || 
                     t.addSeatData?.lngSessionId || 
                     t.setSeatData?.lngSessionId || 
                     t.initTransId;
      grouped[key].sessions.add(sessId);

      const istDate = new Date(t.createdAt.getTime() + 5.5 * 3600 * 1000).toISOString().split('T')[0];
      grouped[key].dates.add(istDate);

      if (grouped[key].sampleTxs.length < 2) {
        grouped[key].sampleTxs.push({
          initTransId: t.initTransId,
          createdAt: t.createdAt,
          seatInfo: t.addSeatData?.strSeatInfo || t.setSeatData?.strSeatInfo,
          multipayment: t.logs?.find(l => l.vistaBookingRequest)?.multipayment,
          vistaError: t.vistaErrorResponse
        });
      }
    }

    const tableData = Object.entries(grouped)
      .sort((a, b) => b[1].count - a[1].count)
      .map(([km, d]) => ({
        Cinema_Movie: km,
        Failures: d.count,
        Distinct_Sessions: d.sessions.size,
        Dates: Array.from(d.dates).join(', ')
      }));

    console.table(tableData);

    // Let's also check for seat collisions: did the same seats get booked by another transaction?
    console.log('\n=== Checking for Seat Collisions ===');
    let collisionCount = 0;
    for (const t of status4Txs) {
      const seats = t.addSeatData?.strSeatInfo || t.setSeatData?.strSeatInfo;
      const sessId = t.paymentResponse?.notes?.sessionId || t.addSeatData?.lngSessionId;
      if (seats && sessId) {
        // Find if any successful transaction (status: 1) booked the same session and overlapping seats
        const colliding = await db.collection('transactions').findOne({
          _id: { $ne: t._id },
          status: 1,
          $or: [
            { "addSeatData.strSeatInfo": seats },
            { "setSeatData.strSeatInfo": seats },
            { "commitBookingData.strSeatInfo": seats }
          ]
        });
        if (colliding) {
          collisionCount++;
          console.log(`Collision found for TX ${t.initTransId}: Seats "${seats}" also in TX ${colliding.initTransId} (Status: ${colliding.status})`);
        }
      }
    }
    console.log(`Total seat collisions found with Status 1: ${collisionCount}`);

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

run();
