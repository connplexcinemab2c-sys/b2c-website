import mongoose from "mongoose";
import axios from "axios";

const targetCinemas = [
  { id: "CN40", name: "NAROL" },
  { id: "CN42", name: "ADANI" },
  { id: "CN47", name: "FARIDABAD" },
  { id: "CN27", name: "BHARUCH" },
  { id: "CN31", name: "JAJPUR" },
  { id: "CN46", name: "JAMMU" },
  { id: "CN43", name: "JAMSHEDPUR" },
  { id: "CN44", name: "JUNAGADH" },
  { id: "CN95", name: "BHIKHANA PAHARI" },
  { id: "CN92", name: "SHEIKHPURA" },
  { id: "CN96", name: "SOLAPUR" },
  { id: "CN25", name: "SRI SRI - TADEPALLIGUDEM" },
  { id: "CN12", name: "UMERKOTE" },
  { id: "CN45", name: "ICONIC HARNI" }
];

const MONGO_URL = "mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin";
const BACKEND_URL = "https://backend.theconnplex.com";

async function testFrontendApis() {
  await mongoose.connect(MONGO_URL);
  const db = mongoose.connection.db;

  const today = new Date().toISOString().split("T")[0];
  console.log(`Testing Frontend APIs for 14 cinemas (Date: ${today})\n`);

  for (const item of targetCinemas) {
    const c = await db.collection("cinemas").findOne({ cinemaId: item.id });
    if (!c) {
      console.log(`[${item.id}] ${item.name} NOT FOUND IN DB`);
      continue;
    }

    // 1. Test get-movies-by-region
    let regionMovies = [];
    try {
      const res = await axios.get(`${BACKEND_URL}/api/user/get-movies-by-region/${c.regionId}`, { timeout: 6000 });
      regionMovies = res.data?.data || [];
    } catch (e) {
      regionMovies = `ERR: ${e.message}`;
    }

    // 2. Test movie-shows-by-cinema
    let cinemaShows = null;
    try {
      const res = await axios.post(`${BACKEND_URL}/api/user/movie-shows-by-cinema`, {
        cinemaId: c._id.toString(),
        date: today
      }, { timeout: 6000 });
      cinemaShows = res.data?.data;
    } catch (e) {
      cinemaShows = `ERR: ${e.message}`;
    }

    console.log(`================================================================`);
    console.log(`[${item.id}] ${item.name} (${c.displayName || c.cinemaName})`);
    console.log(`  RegionId: ${c.regionId}`);
    console.log(`  get-movies-by-region count: ${Array.isArray(regionMovies) ? regionMovies.length : regionMovies}`);
    if (typeof cinemaShows === "string") {
      console.log(`  movie-shows-by-cinema: ${cinemaShows}`);
    } else {
      const moviesWithShows = cinemaShows?.movieDetailsWithShows || [];
      const timingCinemawise = cinemaShows?.timingCinemawise || [];
      console.log(`  movie-shows-by-cinema => moviesWithShows: ${moviesWithShows.length}, timingCinemawise: ${timingCinemawise.length}`);
      if (moviesWithShows.length > 0) {
        moviesWithShows.forEach(m => {
          console.log(`    Movie: "${m.movieDetails?.name}" -> shows: ${m.shows?.length}`);
        });
      }
    }
  }

  await mongoose.disconnect();
}

testFrontendApis().catch(console.error);
