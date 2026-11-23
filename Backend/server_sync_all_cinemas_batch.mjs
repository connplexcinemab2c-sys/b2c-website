import mongoose from 'mongoose';
import axios from 'axios';
import fs from 'fs';
import { movieSync, showSync, todayShowSync, priceDataSyncCinemaWise } from './src/controller/admin/CinemaWiseDataSync.js';
import Cinema from './src/models/Cinema.js';
import Movie from './src/models/Movies.js';
import Price from './src/models/Price.js';
import cacheHelper from './src/utils/cacheHelper.js';
import cacheKeys from './src/utils/cacheKeys.js';

const VISTA_URL = process.env.VISTA_URL || 'http://14.194.50.141';
const MONGO_URL = process.env.MONGO_URL || 'mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin';
const LOCK_FILE = '/tmp/connplex_sync.lock';

// Max cinemas to trigger DatabaseSync for in a single cron run (keeps run time ~3-4 mins)
const MAX_DBSYNC_PER_RUN = 18;
// Minimum interval before a cinema is eligible for routine DatabaseSync (2 hours)
const DBSYNC_INTERVAL_MS = 2 * 60 * 60 * 1000;

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function acquireLock() {
  if (fs.existsSync(LOCK_FILE)) {
    try {
      const pid = fs.readFileSync(LOCK_FILE, 'utf8').trim();
      if (pid) {
        // Check if process is still running
        process.kill(Number(pid), 0);
        console.log(`[${new Date().toISOString()}] Sync already running with PID ${pid}. Skipping this run.`);
        process.exit(0);
      }
    } catch (e) {
      // Process is not running; stale lock file
      console.log(`[${new Date().toISOString()}] Stale lock file found. Overwriting lock.`);
    }
  }
  try {
    fs.writeFileSync(LOCK_FILE, String(process.pid));
  } catch (err) {
    console.warn('Could not write lock file:', err.message);
  }
}

function releaseLock() {
  try {
    if (fs.existsSync(LOCK_FILE)) {
      const pid = fs.readFileSync(LOCK_FILE, 'utf8').trim();
      if (pid === String(process.pid)) {
        fs.unlinkSync(LOCK_FILE);
      }
    }
  } catch (e) {
    // Ignore cleanup error
  }
}

process.on('exit', releaseLock);
process.on('SIGINT', () => { releaseLock(); process.exit(1); });
process.on('SIGTERM', () => { releaseLock(); process.exit(1); });

async function main() {
  acquireLock();
  console.log(`[${new Date().toISOString()}] ================= Starting Multi-Location Cinema Sync =================`);
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

  // 2. Identify cinemas needing DatabaseSync on Vista Central
  const now = new Date();
  const showsCollection = mongoose.connection.db.collection('shows');
  const cinemasCollection = mongoose.connection.db.collection('cinemas');

  // Find cinemas with active future shows in MongoDB
  const cinemasWithFutureShows = new Set(
    await showsCollection.distinct('cinemaId', {
      isActive: true,
      deletedStatus: 0,
      sessionRealShow: { $gte: now },
    })
  );

  const urgentCinemas = [];  // 0 future shows in MongoDB
  const failedCinemas = [];  // Last DatabaseSync failed
  const routineCinemas = []; // Haven't synced in > 2 hours

  for (const c of activeCinemas) {
    const cid = c.cinemaId.toUpperCase();
    const hasShows = cinemasWithFutureShows.has(cid);
    const lastDbSync = c.lastVistaDbSync ? new Date(c.lastVistaDbSync).getTime() : 0;
    const timeSinceLastDbSync = Date.now() - lastDbSync;

    if (!hasShows) {
      urgentCinemas.push(c);
    } else if (c.lastVistaDbSyncStatus === false) {
      failedCinemas.push(c);
    } else if (timeSinceLastDbSync > DBSYNC_INTERVAL_MS) {
      routineCinemas.push({ cinema: c, lastDbSync });
    }
  }

  // Sort routine cinemas by oldest lastDbSync first (LRU)
  routineCinemas.sort((a, b) => a.lastDbSync - b.lastDbSync);

  // Combine candidates: urgent first, then failed, then routine up to MAX_DBSYNC_PER_RUN
  const toSyncSet = new Set();
  const dbsyncCandidates = [];

  for (const c of urgentCinemas) {
    if (!toSyncSet.has(c.cinemaId)) {
      toSyncSet.add(c.cinemaId);
      dbsyncCandidates.push({ cinema: c, reason: 'URGENT: 0 future shows in DB' });
    }
  }

  for (const c of failedCinemas) {
    if (!toSyncSet.has(c.cinemaId) && dbsyncCandidates.length < MAX_DBSYNC_PER_RUN) {
      toSyncSet.add(c.cinemaId);
      dbsyncCandidates.push({ cinema: c, reason: 'RETRY: previous DatabaseSync failed' });
    }
  }

  for (const item of routineCinemas) {
    if (!toSyncSet.has(item.cinema.cinemaId) && dbsyncCandidates.length < MAX_DBSYNC_PER_RUN) {
      toSyncSet.add(item.cinema.cinemaId);
      const hoursAgo = item.lastDbSync ? ((Date.now() - item.lastDbSync) / (3600 * 1000)).toFixed(1) : 'never';
      dbsyncCandidates.push({ cinema: item.cinema, reason: `ROUTINE: last synced ${hoursAgo}h ago` });
    }
  }

  console.log(`\nCinemas selected for Vista Central DatabaseSync: ${dbsyncCandidates.length}`);
  for (const item of dbsyncCandidates) {
    console.log(`  - [${item.cinema.cinemaId}] ${item.cinema.displayName || item.cinema.cinemaName} (${item.reason})`);
  }

  // 3. Execute DatabaseSync sequentially for selected cinemas
  if (dbsyncCandidates.length > 0) {
    console.log('\nExecuting Vista Central DatabaseSync sequentially...');
    for (const item of dbsyncCandidates) {
      const cid = item.cinema.cinemaId.toUpperCase();
      const webUrl = item.cinema.cinemaWebServiceUrl;
      const startCinemaSync = Date.now();

      try {
        // Step 3a: Update Web Service URL on Vista Central if available
        if (webUrl) {
          try {
            await axios.get(
              `${VISTA_URL}/api.asmx/UpdateCinemawebservicesURL?strCinemaId=${cid}&strWebServiceURL=${encodeURIComponent(webUrl)}`,
              { timeout: 12000 }
            );
          } catch (urlErr) {
            console.warn(`  [${cid}] UpdateCinemawebservicesURL warning: ${urlErr.message}`);
          }
          await sleep(1500);
        }

        // Step 3b: Trigger DatabaseSync
        const syncRes = await axios.get(
          `${VISTA_URL}/api.asmx/DatabaseSync?strCinemaId=${cid}`,
          { timeout: 35000 }
        );

        const duration = ((Date.now() - startCinemaSync) / 1000).toFixed(1);
        const isSuccess = syncRes.data?.Status == 1 || syncRes.data?.Status == '1';

        console.log(`  [${cid}] DatabaseSync completed in ${duration}s (Status: ${syncRes.data?.Status})`);

        await cinemasCollection.updateOne(
          { cinemaId: cid },
          {
            $set: {
              lastVistaDbSync: new Date(),
              lastVistaDbSyncStatus: isSuccess,
            }
          }
        );
      } catch (err) {
        const duration = ((Date.now() - startCinemaSync) / 1000).toFixed(1);
        console.error(`  [${cid}] DatabaseSync FAILED in ${duration}s: ${err.message}`);
        await cinemasCollection.updateOne(
          { cinemaId: cid },
          {
            $set: {
              lastVistaDbSync: new Date(),
              lastVistaDbSyncStatus: false,
            }
          }
        );
      }

      // 2s pause between cinemas to avoid Vista Central temporary file locking (data.tmp)
      await sleep(2000);
    }
  }

  // 4. Pre-fetch Global Sessions from Vista Central
  console.log('\nFetching global sessions from Vista Central...');
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

  // 5. Pre-fetch Global Movies/Details from Vista Central
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

  // 6. Build in-memory lookup maps for high performance
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

  // 7. Sync each cinema into MongoDB
  console.log(`\nBeginning batch data sync into MongoDB for ${activeCinemas.length} cinemas...`);
  let successCount = 0;
  let failCount = 0;

  for (const cinema of activeCinemas) {
    const cid = cinema.cinemaId.toUpperCase();
    const cName = cinema.displayName || cinema.cinemaName;
    const startCinema = Date.now();

    try {
      // Step A: Movie Sync
      const movieRes = await movieSync(cid, globalDetails, cinemaMap);
      if (movieRes?.movieResultMap) {
        movieMapByCinema.set(cid, movieRes.movieResultMap);
      }

      // Step B: Show Sync (now applies generalized screenStatus: O when WWW / seats available)
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

  // 8. Clear front-end caches
  try {
    cacheHelper.deleteManyCache([cacheKeys.upcomingMovieData]);
    cacheHelper.deleteKeysByPrefix('region_movies_data_');
    cacheHelper.deleteKeysByPrefix('recent_release_region_movie_data_');
    console.log('✓ Cleared front-end redis/in-memory caches');
  } catch (cErr) {
    console.warn('Cache clear note:', cErr.message);
  }

  // 9. Verification Summary
  const endNow = new Date();
  const totalActiveShows = await mongoose.connection.db.collection('shows').countDocuments({
    isActive: true,
    deletedStatus: 0,
    sessionRealShow: { $gte: endNow },
  });

  const activeCinemasWithShows = await mongoose.connection.db.collection('shows').distinct('cinemaId', {
    isActive: true,
    deletedStatus: 0,
    sessionRealShow: { $gte: endNow },
  });

  console.log(`\n=================== SYNC SUMMARY ===================`);
  console.log(`Cinemas Processed: ${activeCinemas.length} (Success: ${successCount}, Failed: ${failCount})`);
  console.log(`Total Future Shows in MongoDB: ${totalActiveShows}`);
  console.log(`Cinemas with Active Future Shows: ${activeCinemasWithShows.length} / ${activeCinemas.length}`);

  const missingCinemas = activeCinemas.map(c => c.cinemaId.toUpperCase()).filter(cid => !activeCinemasWithShows.includes(cid));
  if (missingCinemas.length > 0) {
    console.log(`⚠️ Cinemas without future shows: ${missingCinemas.join(', ')}`);
  } else {
    console.log(`✓ 100% of active cinemas have valid future shows!`);
  }
  console.log(`====================================================\n`);

  await mongoose.disconnect();
}

main().catch(err => {
  console.error('Fatal sync failure:', err);
  process.exit(1);
});
