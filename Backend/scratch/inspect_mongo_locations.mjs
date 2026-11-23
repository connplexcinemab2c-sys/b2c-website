import mongoose from "mongoose";

const targetLocations = [
  "NAROL",
  "ADANI",
  "FARIDABAD",
  "BHARUCH",
  "JAJPUR",
  "JAMMU",
  "JAMSHEDPUR",
  "JUNAGADH",
  "BHIKHANA PAHARI",
  "SHEIKHPURA",
  "SOLAPUR",
  "SRI SRI – TADEPALLIGUDEM",
  "TADEPALLIGUDEM",
  "UMERKOTE",
  "ICONIC HARNI",
  "HARNI"
];

const MONGO_URL = "mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin";

async function inspectMongo() {
  await mongoose.connect(MONGO_URL, { serverSelectionTimeoutMS: 5000 });
  const db = mongoose.connection.db;

  const allCinemas = await db.collection("cinemas").find({}).toArray();
  const allRegions = await db.collection("regions").find({}).toArray();
  const regionMap = Object.fromEntries(allRegions.map(r => [r._id.toString(), r]));

  console.log(`Total cinemas in Mongo: ${allCinemas.length}`);
  console.log(`Total regions in Mongo: ${allRegions.length}`);

  for (const c of allCinemas) {
    const name = (c.displayName || c.cinemaName || "").toLowerCase();
    const branch = (c.cinemaBranchCode || "").toLowerCase();
    const id = (c.cinemaId || "").toLowerCase();

    const isMatch = targetLocations.some(loc => {
      const cleanLoc = loc.toLowerCase().replace(/[^a-z0-9]/g, "");
      const cleanName = name.replace(/[^a-z0-9]/g, "");
      const cleanBranch = branch.replace(/[^a-z0-9]/g, "");
      return cleanName.includes(cleanLoc) || cleanBranch.includes(cleanLoc) || (cleanLoc.length > 2 && cleanLoc.includes(cleanName));
    });

    if (isMatch) {
      const reg = regionMap[c.regionId?.toString()];
      console.log(`\n--------------------------------------------------`);
      console.log(`Cinema ID: ${c.cinemaId} | Name: "${c.displayName || c.cinemaName}"`);
      console.log(`  _id: ${c._id}`);
      console.log(`  cinemaBranchCode: "${c.cinemaBranchCode}"`);
      console.log(`  Region: "${reg?.name || reg?.region}" (ID: ${c.regionId}) | Region isActive: ${reg?.isActive} | regDeleted: ${reg?.deletedStatus}`);
      console.log(`  Cinema isActive: ${c.isActive} | deletedStatus: ${c.deletedStatus}`);
      console.log(`  cinemaWebServiceUrl:  "${c.cinemaWebServiceUrl}"`);
      console.log(`  cinemaWebServiceUrl2: "${c.cinemaWebServiceUrl2}"`);
      console.log(`  lastSync: ${c.lastSync}`);
      console.log(`  lastSyncStatus: ${c.lastSyncStatus}`);
      console.log(`  cinemaSyncSequence: ${c.cinemaSyncSequence}`);

      // Count shows in DB for this cinema
      const totalShows = await db.collection("shows").countDocuments({ cinemaObjectId: c._id });
      const activeShows = await db.collection("shows").countDocuments({ cinemaObjectId: c._id, isActive: true, deletedStatus: 0 });
      const futureShows = await db.collection("shows").countDocuments({
        cinemaObjectId: c._id,
        sessionRealShow: { $gte: new Date() },
        isActive: true,
        deletedStatus: 0
      });
      console.log(`  Shows => Total: ${totalShows} | Active: ${activeShows} | Future (>= now): ${futureShows}`);
    }
  }

  await mongoose.disconnect();
}

inspectMongo().catch(console.error);
