import mongoose from 'mongoose';
import { getMoviesByRegion, moviesShowByCinema } from '../Backend/src/controller/user/Movies.js';
import { getCinemasByRegion } from '../Backend/src/controller/user/Cinema.js';
import { getAllCinema } from '../Backend/src/controller/user/UserController.js';
import dotenv from 'dotenv';
dotenv.config({ path: './Backend/.env' });

// Mock response helper
function mockRes() {
  const res = {
    statusCode: null,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.body = data;
      return this;
    }
  };
  return res;
}

async function main() {
  await mongoose.connect('mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin');
  const db = mongoose.connection.db;

  const cinemaIds = ['CN01', 'CN42', 'CN30', 'CN93', 'CN26', 'CN35', 'CN95', 'CN39', 'CN96', 'CN44'];

  for (const cid of cinemaIds) {
    const cinema = await db.collection('cinemas').findOne({ cinemaId: cid });
    if (!cinema) {
      console.log(`Cinema ${cid} not found`);
      continue;
    }

    console.log(`\n================== ${cid}: ${cinema.displayName || cinema.cinemaName} ==================`);
    console.log(`RegionId: ${cinema.regionId}, isActive: ${cinema.isActive}`);

    // Test 1: getCinemasByRegion
    const res1 = mockRes();
    await getCinemasByRegion({ params: { regionId: cinema.regionId.toString() } }, res1);
    const cinemasInRegion = res1.body?.data || [];
    const foundInRegion = cinemasInRegion.find(c => c.cinemaId === cid);
    console.log(`1. getCinemasByRegion: Found in region? ${!!foundInRegion} (Total in region: ${cinemasInRegion.length})`);

    // Test 2: getMoviesByRegion
    const res2 = mockRes();
    await getMoviesByRegion({ params: { regionId: cinema.regionId.toString() } }, res2);
    const moviesInRegion = res2.body?.data || [];
    console.log(`2. getMoviesByRegion: Movies returned: ${moviesInRegion.length}`);
    if (moviesInRegion.length > 0) {
      console.log(`   Sample movies:`, moviesInRegion.slice(0, 3).map(m => m.name));
    }

    // Test 3: moviesShowByCinema (for today)
    const res3 = mockRes();
    const today = new Date().toISOString().slice(0, 10);
    await moviesShowByCinema({ body: { cinemaId: cinema._id.toString(), regionId: cinema.regionId.toString(), date: today } }, res3);
    const movieShows = res3.body?.data?.movieDetailsWithShows || [];
    const totalShowsCount = movieShows.reduce((acc, m) => acc + (m.shows?.length || 0), 0);
    console.log(`3. moviesShowByCinema (${today}): Movies with shows: ${movieShows.length}, Total shows: ${totalShowsCount}`);
  }

  // Test getAllCinema
  const resAll = mockRes();
  await getAllCinema({}, resAll);
  const allCinemas = resAll.body?.data || [];
  console.log(`\n================== getAllCinema ==================`);
  console.log(`Total visible cinemas: ${allCinemas.length}`);
  for (const cid of cinemaIds) {
    const cinema = await db.collection('cinemas').findOne({ cinemaId: cid });
    const inAll = allCinemas.find(c => c._id.toString() === cinema?._id.toString());
    console.log(`${cid} in getAllCinema: ${!!inAll}`);
  }

  await mongoose.disconnect();
}

main().catch(console.error);
