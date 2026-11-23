import mongoose from "mongoose";

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

async function deepInspect() {
  await mongoose.connect(MONGO_URL);
  const db = mongoose.connection.db;

  const now = new Date();
  console.log(`Current Time (UTC): ${now.toISOString()}`);
  console.log(`Current Time (IST): ${new Date(now.getTime() + 5.5 * 3600 * 1000).toISOString()}\n`);

  for (const item of targetCinemas) {
    const c = await db.collection("cinemas").findOne({ cinemaId: item.id });
    if (!c) {
      console.log(`[NOT FOUND] Cinema ID ${item.id} (${item.name}) not found in DB!`);
      continue;
    }

    const reg = await db.collection("regions").findOne({ _id: c.regionId });

    // Show breakdown
    const totalShows = await db.collection("shows").countDocuments({ cinemaObjectId: c._id });
    const showsByStatus = await db.collection("shows").aggregate([
      { $match: { cinemaObjectId: c._id } },
      { $group: { _id: "$screenStatus", count: { $sum: 1 } } }
    ]).toArray();

    // Future shows (>= now)
    const futureShowsByStatus = await db.collection("shows").aggregate([
      { $match: { cinemaObjectId: c._id, sessionRealShow: { $gte: now }, deletedStatus: 0 } },
      { $group: { _id: { screenStatus: "$screenStatus", isActive: "$isActive" }, count: { $sum: 1 } } }
    ]).toArray();

    // Latest show date in DB
    const latestShow = await db.collection("shows").findOne(
      { cinemaObjectId: c._id },
      { sort: { sessionRealShow: -1 } }
    );

    console.log(`================================================================`);
    console.log(`Cinema: ${item.id} | ${c.displayName || c.cinemaName}`);
    console.log(`  isActive: ${c.isActive} | deleted: ${c.deletedStatus} | BranchCode: ${c.cinemaBranchCode}`);
    console.log(`  Region: "${reg?.name || reg?.region}" | Region isActive: ${reg?.isActive} | regDeleted: ${reg?.deletedStatus}`);
    console.log(`  URL1: ${c.cinemaWebServiceUrl}`);
    console.log(`  URL2: ${c.cinemaWebServiceUrl2}`);
    console.log(`  lastSync: ${c.lastSync} | lastSyncStatus: ${c.lastSyncStatus}`);
    console.log(`  Total shows in DB: ${totalShows}`);
    console.log(`  Shows by status (all time):`, JSON.stringify(showsByStatus));
    console.log(`  Future shows (>= now, not deleted):`, JSON.stringify(futureShowsByStatus));
    console.log(`  Latest show date in DB: ${latestShow ? latestShow.sessionRealShow : "NONE"}`);
    if (latestShow) {
      console.log(`    Sample latest show: session: ${latestShow.sessionId}, film: "${latestShow.filmTitle || latestShow.filmCode}", status: "${latestShow.screenStatus}", active: ${latestShow.isActive}`);
    }
  }

  await mongoose.disconnect();
}

deepInspect().catch(console.error);
