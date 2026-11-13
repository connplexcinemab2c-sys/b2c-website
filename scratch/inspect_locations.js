const { MongoClient } = require('mongodb');

async function check() {
  const client = new MongoClient('mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin');
  await client.connect();
  const db = client.db();

  const regions = await db.collection('regions').find({ isActive: true, deletedStatus: 0 }).sort({ region: 1 }).toArray();
  const cinemas = await db.collection('cinemas').find({ isActive: true, deletedStatus: 0 }).toArray();
  const shows = await db.collection('shows').find({ sessionRealShow: { $gte: new Date() } }).toArray();

  console.log(`Active regions: ${regions.length}`);
  console.log(`Active cinemas: ${cinemas.length}`);
  console.log(`Future shows count: ${shows.length}`);

  const cinemaWithShows = new Set(shows.map(s => s.cinemaId || (s.cinemaObjectId && s.cinemaObjectId.toString())));

  let regionsWithCinemas = 0;
  let regionsWithShows = 0;

  for (const r of regions) {
    const cList = cinemas.filter(c => c.regionId && c.regionId.toString() === r._id.toString());
    const showsInRegion = shows.filter(s => cList.some(c => (c._id && c._id.toString() === (s.cinemaObjectId && s.cinemaObjectId.toString())) || (c.cinemaId && c.cinemaId === s.cinemaId)));
    if (cList.length > 0) regionsWithCinemas++;
    if (showsInRegion.length > 0) regionsWithShows++;

    console.log(`[Region ${r.region}] ID: ${r._id} | Cinemas: ${cList.length} | Future shows: ${showsInRegion.length}`);
    for (const c of cList) {
      const cShows = shows.filter(s => (s.cinemaObjectId && s.cinemaObjectId.toString() === c._id.toString()) || s.cinemaId === c.cinemaId);
      console.log(`   -> Cinema: [${c.cinemaId}] "${c.displayName || c.cinemaName}" | Shows: ${cShows.length}`);
    }
  }

  console.log(`\nSummary: ${regions.length} active regions. ${regionsWithCinemas} have active cinemas. ${regionsWithShows} have future shows.`);

  await client.close();
}

check().catch(console.error);
