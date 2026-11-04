import mongoose from "mongoose";

const MONGO_URL = "mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin";

async function checkTx() {
  await mongoose.connect(MONGO_URL);
  const db = mongoose.connection.db;

  const txs = await db.collection("transactions")
    .find({ initTransId: { $in: ["20000252968", "20000244287", "20000252967"] } })
    .toArray();

  for (const t of txs) {
    console.log("-----------------------");
    console.log({
      initTransId: t.initTransId,
      cinemaId: t.cinemaId,
      showId: t.showId,
      sessionId: t.sessionId,
      selectedSeats: t.selectedSeats,
      seats: t.seats,
      seatDetails: t.seatDetails,
      tTypeCode: t.tTypeCode,
      qty: t.qty,
      createdAt: t.createdAt
    });
  }

  // Also let's check the most recent 3 transactions in the collection
  console.log("\n=== Most recent 3 transactions ===");
  const recent = await db.collection("transactions").find().sort({ _id: -1 }).limit(3).toArray();
  for (const t of recent) {
    console.log({
      _id: t._id,
      initTransId: t.initTransId,
      cinemaId: t.cinemaId,
      sessionId: t.sessionId,
      seats: t.seats,
      selectedSeats: t.selectedSeats,
      addSeatData: t.addSeatData
    });
  }

  await mongoose.disconnect();
}

checkTx().catch(console.error);
