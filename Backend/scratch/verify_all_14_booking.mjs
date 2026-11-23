import mongoose from 'mongoose';
import axios from 'axios';

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

async function verifyBooking() {
  await mongoose.connect(MONGO_URL);
  const db = mongoose.connection.db;

  console.log("=== Comprehensive Verification of All 14 Cinemas ===");
  const results = [];

  for (const item of targetCinemas) {
    const c = await db.collection("cinemas").findOne({ cinemaId: item.id });
    if (!c) {
      results.push({ id: item.id, name: item.name, status: "CINEMA NOT FOUND" });
      continue;
    }

    // 1. Check future shows
    const futureShows = await db.collection("shows").find({
      cinemaObjectId: c._id,
      sessionRealShow: { $gte: new Date() },
      screenStatus: { $ne: "C" },
      isActive: true,
      deletedStatus: 0
    }).sort({ sessionRealShow: 1 }).limit(1).toArray();

    if (futureShows.length === 0) {
      results.push({ id: item.id, name: item.name, status: "NO FUTURE SHOWS" });
      continue;
    }

    const testShow = futureShows[0];
    const movie = await db.collection("movies").findOne({ _id: testShow.filmObjectId });

    // 2. Test Seat Layout
    let seatLayoutStatus = "FAIL";
    let seatCount = 0;
    try {
      const seatRes = await axios.get(
        `${BACKEND_URL}/api/seat-layout/${item.id}/${testShow.sessionId}`,
        { timeout: 8000 }
      );
      if (seatRes.status === 200 && (seatRes.data?.data?.Status == "1" || seatRes.data?.Status == "1")) {
        const seats = seatRes.data?.data?.data || seatRes.data?.data || [];
        seatCount = Array.isArray(seats) ? seats.length : 0;
        seatLayoutStatus = seatCount > 0 ? "OK" : "EMPTY";
      }
    } catch (e) {
      seatLayoutStatus = `ERR (${e.response?.status || e.code || e.message})`;
    }

    results.push({
      id: item.id,
      name: item.name,
      cinemaName: c.displayName || c.cinemaName,
      firstShowTime: testShow.sessionRealShow,
      sessionId: testShow.sessionId,
      movieName: movie?.name || testShow.filmCode,
      seatLayout: seatLayoutStatus,
      seatsReturned: seatCount,
      bookingAvailable: seatLayoutStatus === "OK" ? "YES" : "NO"
    });
  }

  console.table(results, ["id", "name", "bookingAvailable", "movieName", "sessionId", "seatsReturned", "seatLayout"]);

  const allAvailable = results.every(r => r.bookingAvailable === "YES");
  console.log(`\nOverall Status: ${allAvailable ? "ALL 14 LOCATIONS READY FOR BOOKING!" : "SOME LOCATIONS FAILED"}`);

  await mongoose.disconnect();
}

verifyBooking().catch(console.error);
