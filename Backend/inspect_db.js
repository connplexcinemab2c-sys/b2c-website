import mongoose from "mongoose";

const MONGO_URL = "mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin";

async function inspect() {
  try {
    await mongoose.connect(MONGO_URL);
    console.log("DB connected.");

    const db = mongoose.connection.db;

    // 1. Regions count and list
    const regions = await db.collection("regions").find({}).toArray();
    console.log(`\n--- Regions (${regions.length} total) ---`);
    regions.forEach(r => console.log(`- ${r.region} (ID: ${r._id}, deletedStatus: ${r.deletedStatus})`));

    // 2. Cinemas count and list
    const cinemas = await db.collection("cinemas").find({}).toArray();
    console.log(`\n--- Cinemas (${cinemas.length} total) ---`);
    cinemas.forEach(c => console.log(`- ${c.cinemaName} (ID: ${c._id}, regionId: ${c.regionId})`));

    // 3. Rewards count
    const totalRewards = await db.collection("rewards").countDocuments({});
    const earnedRewards = await db.collection("rewards").countDocuments({ type: "earned" });
    const redeemedRewards = await db.collection("rewards").countDocuments({ type: "redeemed" });
    console.log(`\n--- Rewards ---`);
    console.log(`Total: ${totalRewards}, Earned: ${earnedRewards}, Redeemed: ${redeemedRewards}`);

    // 4. Distribution of transactionId in rewards
    const rewardsWithTx = await db.collection("rewards").find({ transactionId: { $ne: null } }).toArray();
    console.log(`Rewards with transactionId: ${rewardsWithTx.length}`);

    // Let's resolve the transaction -> cinema -> region mapping for these rewards
    const sampleMappings = {};
    for (const r of rewardsWithTx) {
      const tx = await db.collection("transactions").findOne({ _id: r.transactionId });
      if (tx) {
        const cinema = await db.collection("cinemas").findOne({ _id: tx.cinemaId });
        const cinemaName = cinema ? cinema.cinemaName : "No Cinema";
        const region = cinema ? await db.collection("regions").findOne({ _id: cinema.regionId }) : null;
        const regionName = region ? region.region : "No Region";
        
        const key = `${regionName} - ${cinemaName}`;
        sampleMappings[key] = (sampleMappings[key] || 0) + 1;
      } else {
        sampleMappings["Tx Not Found"] = (sampleMappings["Tx Not Found"] || 0) + 1;
      }
    }

    console.log("\n--- Active Rewards Distribution ---");
    Object.entries(sampleMappings).forEach(([k, v]) => {
      console.log(`${k}: ${v} rewards`);
    });

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

inspect();
