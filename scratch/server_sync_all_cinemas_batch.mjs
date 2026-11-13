import mongoose from 'mongoose';
import axios from 'axios';
import { movieSync, showSync, todayShowSync, priceDataSyncCinemaWise } from './src/controller/admin/CinemaWiseDataSync.js';
import Cinema from './src/models/Cinema.js';
import Movie from './src/models/Movies.js';
import Price from './src/models/Price.js';
import cacheHelper from './src/utils/cacheHelper.js';
import cacheKeys from './src/utils/cacheKeys.js';

const VISTA_URL = process.env.VISTA_URL || 'http://14.194.50.141';
const MONGO_URL = process.env.MONGO_URL || 'mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function main() {
  console.log(`[${new Date().toISOString()}] Starting Full Multi-Location Cinema Sync...`);
  await mongoose.connect(MONGO_URL);
  console.log('Connected to MongoDB successfully');

  // 1. Fetch all active cinemas
  const activeCinemas = await Cinema.find({
    cinemaId: { $ne: null },
    deletedStatus: 0,
    isActive: true,
  }).sort({ cinemaId: 1 });

  console.log(`Found ${activeCinemas.length} active cinemas in database.`);
  const cinemaMap = new Map(activeCinemas.map(c => [c.cinemaId.toUpperCase(), c]));

  // 2. Pre-fetch Global Sessions from Vista Central (One single API call for all cinemas)
  console.log('Fetching global sessions from Vista Central...');
  let globalSessions = null;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const sessRes = await axios.get(`${VISTA_URL}/api.asmx/GetAllSession?test=string`, { timeout: 60000 });
      if (sessRes?.data?.Status == 1) {
        globalSessions = sessRes;
        const total = sessRes.data?.data?.SessionList?.length || 0;
        console.log(`✓ Fetched ${total} global sessions from Vista Central.`);
        break;
      }
    } catch (e) {
      console.warn(`Attempt ${attempt} to fetch GetAllSession failed: ${e.message}`);
      if (attempt < 3) await sleep(2000);
    }
  }

  // 3. Pre-fetch Global Movies/Details from Vista Central
  console.log('Fetching global movie details from Vista Central...');
  let globalDetails = null;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const detRes = await axios.get(`${VISTA_URL}/api.asmx/GetAllDetails?test=string`, { timeout: 90000 });
      if (detRes?.data?.Status == 1) {
        globalDetails = detRes;
        const total = detRes.data?.data?.Fillmlist?.length || 0;
        console.log(`✓ Fetched ${total} global movies from Vista Central.`);
        break;
      }
    } catch (e) {
      console.warn(`Attempt ${attempt} to fetch GetAllDetails failed: ${e.message}`);
      if (attempt < 3) await sleep(2000);
    }
  }

  if (!globalSessions) {
    throw new Error('Fatal: Could not retrieve sessions from Vista Central. Aborting sync.');
  }

  // 4. Build in-memory lookup maps for high performance
  const allExistingMovies = await Movie.find({ deletedStatus: 0 });
  const movieMapByCinema = new Map();
  for (const m of allExistingMovies) {
    if (!m.cinemaId || !m.filmCode) continue;
    const cid = m.cinemaId.toUpperCase();
    if (!movieMapByCinema.has(cid)) movieMapByCinema.set(cid, new Map());
    movieMapByCinema.get(cid).set(m.filmCode.trim().toUpperCase(), m._id);
  }

  const allExistingPrices = await Price.find();
  const priceMapByCinema = new Map();
  for (const p of allExistingPrices) {
    if (!p.cinemaId || !p.pGroupCode) continue;
    const cid = p.cinemaId.toUpperCase();
    if (!priceMapByCinema.has(cid)) priceMapByCinema.set(cid, new Map());
    priceMapByCinema.get(cid).set(p.pGroupCode.trim().toUpperCase(), p._id);
  }

  // 5. Sync each cinema
  console.log(`\nBeginning batch sync for ${activeCinemas.length} cinemas...`);
  let successCount = 0;
  let failCount = 0;

  for (const cinema of activeCinemas) {
    const cid = cinema.cinemaId.toUpperCase();
    const cName = cinema.displayName || cinema.cinemaName;
    const startCinema = Date.now();

    try {
      // Step A: Movie Sync (uses globalDetails if available, no per-cinema HTTP call)
      const movieRes = await movieSync(cid, globalDetails, cinemaMap);
      if (movieRes?.movieResultMap) {
        movieMapByCinema.set(cid, movieRes.movieResultMap);
      }

      // Step B: Show Sync (uses globalSessions, no per-cinema HTTP call)
      const cinemaMovieMap = movieMapByCinema.get(cid) || null;
      const cinemaPriceMap = priceMapByCinema.get(cid) || null;
      const showsSynced = await showSync(cid, globalSessions, cinemaMap, cinemaMovieMap, cinemaPriceMap);

      // Step C: Today Show Sync
      try {
        await todayShowSync(cid, globalSessions, cinemaMap, cinemaMovieMap, cinemaPriceMap);
      } catch (tsErr) {
        // Non-blocking
      }

      // Step D: Price Packages & Prices
      try {
        await priceDataSyncCinemaWise(cid, globalDetails, cinemaMap);
      } catch (pErr) {
        // Non-blocking
      }

      const elapsed = ((Date.now() - startCinema) / 1000).toFixed(1);
      console.log(`[${cid}] ${cName} -> Synced in ${elapsed}s (shows: ${showsSynced || 0})`);

      await Cinema.updateOne(
        { cinemaId: cid },
        { $set: { lastSync: new Date(), lastSyncStatus: true } }
      );
      successCount++;
    } catch (cErr) {
      console.error(`[${cid}] ${cName} -> ERROR: ${cErr.message}`);
      await Cinema.updateOne(
        { cinemaId: cid },
        { $set: { lastSync: new Date(), lastSyncStatus: false } }
      );
      failCount++;
    }
  }

  // 6. Clear front-end caches
  try {
    cacheHelper.deleteManyCache([cacheKeys.upcomingMovieData]);
    cacheHelper.deleteKeysByPrefix('region_movies_data_');
    cacheHelper.deleteKeysByPrefix('recent_release_region_movie_data_');
    console.log('✓ Cleared front-end redis/in-memory caches');
  } catch (cErr) {
    console.warn('Cache clear note:', cErr.message);
  }

  // 7. Verification Summary
  const now = new Date();
  const totalActiveShows = await mongoose.connection.db.collection('shows').countDocuments({
    isActive: true,
    deletedStatus: 0,
    sessionRealShow: { $gte: now },
  });

  const cinemasWithShows = await mongoose.connection.db.collection('shows').distinct('cinemaId', {
    isActive: true,
    deletedStatus: 0,
    sessionRealShow: { $gte: now },
  });

  console.log(`\n=================== SYNC SUMMARY ===================`);
  console.log(`Cinemas Processed: ${activeCinemas.length} (Success: ${successCount}, Failed: ${failCount})`);
  console.log(`Total Future Shows in MongoDB: ${totalActiveShows}`);
  console.log(`Cinemas with Future Shows: ${cinemasWithShows.length} / ${activeCinemas.length}`);
  console.log(`Cinemas list with future shows: ${cinemasWithShows.sort().join(', ')}`);
  console.log(`====================================================\n`);

  await mongoose.disconnect();
}

main().catch(err => {
  console.error('Fatal sync failure:', err);
  process.exit(1);
});
