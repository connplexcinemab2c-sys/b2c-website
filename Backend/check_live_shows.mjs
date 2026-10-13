import axios from 'axios';
import mongoose from 'mongoose';

const BASE_URL = 'https://backend.theconnplex.com/api';

async function main() {
  await mongoose.connect('mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin');
  const db = mongoose.connection.db;

  const targetCinemas = ['CN01', 'CN42', 'CN30', 'CN93', 'CN26', 'CN35', 'CN95', 'CN39', 'CN96', 'CN44'];
  const today = '2026-10-13';

  for (const cid of targetCinemas) {
    const c = await db.collection('cinemas').findOne({ cinemaId: cid });
    if (!c) continue;

    console.log(`\n================== ${cid}: ${c.displayName || c.cinemaName} ==================`);
    console.log(`  lastSyncStatus: ${c.lastSyncStatus}, lastSync: ${c.lastSync}, refresh: ${c.cinemaLastDataRefresh}`);

    try {
      const res = await axios.post(`${BASE_URL}/user/movie-shows-by-cinema`, {
        cinemaId: c._id.toString(),
        regionId: c.regionId?.toString(),
        date: today
      }, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      const moviesWithShows = res.data?.data?.movieDetailsWithShows || [];
      let totalShows = 0;
      for (const m of moviesWithShows) {
        totalShows += m.shows?.length || 0;
      }
      console.log(`  Live movie-shows-by-cinema (${today}): ${moviesWithShows.length} movies, ${totalShows} total shows`);
      if (moviesWithShows.length > 0) {
        console.log(`  Movies: ${moviesWithShows.map(m => m.movieDetails?.name || m._id).join(', ')}`);
      }
    } catch (e) {
      console.log(`  movie-shows-by-cinema ERROR: ${e.response?.status} - ${e.message}`);
    }
  }

  await mongoose.disconnect();
}

main().catch(console.error);
