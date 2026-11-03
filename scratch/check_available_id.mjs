import mongoose from "mongoose";

async function main() {
  await mongoose.connect("mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin");
  const db = mongoose.connection.db;

  const cinemas = await db.collection("cinemas").find().toArray();
  console.log("All cinema IDs (including deleted):", cinemas.map(c => ({ id: c.cinemaId, name: c.cinemaName, deleted: c.deletedStatus })));

  const harni = await db.collection("cinemas").findOne({ cinemaId: "CN45" });
  console.log("CN45 Harni record:", harni);

  await mongoose.disconnect();
}

main();
