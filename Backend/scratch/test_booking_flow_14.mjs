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

async function testBookingFlow() {
  await mongoose.connect(MONGO_URL);
  const db = mongoose.connection.db;

  const today = new Date().toISOString().split("T")[0];
  console.log(`Testing Booking Flow for 14 cinemas for date: ${today}\n`);

  for (const item of targetCinemas) {
    const cinema = await db.collection("cinemas").findOne({ cinemaId: item.id });
    if (!cinema) {
      console.log(`[${item.id}] ${item.name} NOT FOUND IN DB`);
      continue;
    }

    console.log(`================================================================`);
    console.log(`[${item.id}] ${item.name} (${cinema.displayName || cinema.cinemaName})`);
    console.log(`  cinemaObjectId: ${cinema._id}`);
    console.log(`  URL: ${cinema.cinemaWebServiceUrl}`);

    // Step 1: Check how many active shows exist in DB today or in future
    const futureShows = await db.collection("shows").find({
      cinemaObjectId: cinema._id,
      sessionRealShow: { $gte: new Date() },
      isActive: true,
      deletedStatus: 0
    }).sort({ sessionRealShow: 1 }).limit(3).toArray();

    console.log(`  Future shows in DB: ${futureShows.length} found`);
    if (futureShows.length === 0) {
      console.log(`  -> ISSUE: 0 future shows in DB! Booking impossible because no shows exist.`);
      continue;
    }

    // Step 2: Check if movies for these shows exist and are active
    for (const show of futureShows) {
      console.log(`  Show: SessionId=${show.sessionId}, time=${show.sessionRealShow}, status=${show.screenStatus}, filmCode=${show.filmCode}, filmObjectId=${show.filmObjectId}`);
      const movie = show.filmObjectId ? await db.collection("movies").findOne({ _id: show.filmObjectId }) : null;
      console.log(`    Movie in DB: ${movie ? `"${movie.name}" (active: ${movie.isActive}, uniqueCode: ${movie.uniqueFilmCode})` : "NOT FOUND (NULL)"}`);

      // Step 3: Test seat layout API on live backend
      try {
        const layoutPayload = {
          cinemaId: item.id,
          sessionId: String(show.sessionId)
        };
        const layoutRes = await axios.post(`${BACKEND_URL}/api/user/planCodeSeatLayout`, layoutPayload, { timeout: 10000 });
        console.log(`    SeatLayout API: Status=${layoutRes.status}, dataStatus=${layoutRes.data?.status}, msg=${layoutRes.data?.message || layoutRes.data?.error || ""}`);
        if (layoutRes.data?.data) {
          const areaCount = layoutRes.data.data.AreaCategoryList?.length || 0;
          console.log(`    SeatLayout SUCCESS: ${areaCount} area categories returned.`);
        }
      } catch (err) {
        console.log(`    SeatLayout API FAILED: ${err.message} - ${err.response?.status} - ${JSON.stringify(err.response?.data || "")}`);
      }
      break; // Test only the first future show
    }
  }

  await mongoose.disconnect();
}

testBookingFlow().catch(console.error);
