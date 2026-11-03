import mongoose from "mongoose";

async function check() {
  console.log("=== Checking Vista Central methods ===");
  try {
    const res = await fetch("http://14.194.50.141/api.asmx");
    const html = await res.text();
    const ops = [];
    const re = /href="api\.asmx\?op=([^"]+)"/g;
    let m;
    while ((m = re.exec(html)) !== null) {
      ops.push(m[1]);
    }
    console.log("Vista Central Operations:", ops);
  } catch (e) {
    console.error("Vista Central error:", e.message);
  }

  console.log("\n=== Checking Jammu Local URL methods ===");
  try {
    const res = await fetch("http://182.65.36.40/VistaWebService/clsbook.asmx");
    const html = await res.text();
    const ops = [];
    const re = /href="clsbook\.asmx\?op=([^"]+)"/g;
    let m;
    while ((m = re.exec(html)) !== null) {
      ops.push(m[1]);
    }
    console.log("Jammu Operations:", ops);
  } catch (e) {
    console.error("Jammu error:", e.message);
  }

  console.log("\n=== Checking MongoDB Cinema IDs ===");
  try {
    await mongoose.connect("mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin");
    const db = mongoose.connection.db;
    const cinemas = await db.collection("cinemas").find({ deletedStatus: 0 }).toArray();
    console.log("All Cinema IDs in DB:", cinemas.map(c => c.cinemaId).sort());
    
    // Check if Jammu or 6385 exists anywhere in DB
    const jammuInCinemas = await db.collection("cinemas").find({
      $or: [
        { cinemaName: /jammu/i },
        { displayName: /jammu/i },
        { cinemaLicenseNumber: "6385" },
        { websiteLicenseNumber: 6385 },
        { cinemaWebServiceUrl: /182\.65\.36\.40/ }
      ]
    }).toArray();
    console.log("Any existing Jammu in cinemas:", jammuInCinemas);

    // Check regions
    const regions = await db.collection("regions").find({ deletedStatus: 0 }).toArray();
    console.log("Regions in DB:", regions.map(r => r.region).sort());

    await mongoose.disconnect();
  } catch (e) {
    console.error("DB error:", e.message);
  }
}

check();
