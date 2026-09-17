import mongoose from "mongoose";

const MONGO_URL = "mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin";

async function run() {
  try {
    await mongoose.connect(MONGO_URL);
    const db = mongoose.connection.db;
    const cols = await db.listCollections().toArray();
    console.log("Searching in", cols.length, "collections...");
    for (const col of cols) {
      try {
        const found = await db.collection(col.name).find({
          $or: [
            { businessEmail: "guptajahnvi47@gmail.com" },
            { businessName: "way2reach" },
            { email: "guptajahnvi47@gmail.com" },
            { name: "way2reach" },
            { phone: "9511310113" },
            { businessPhoneNumber: "9511310113" }
          ]
        }).toArray();
        if (found.length > 0) {
          console.log(`Found ${found.length} docs in collection: ${col.name}`);
          console.log(JSON.stringify(found, null, 2));
        }
      } catch (err) {
        // ignore errors on views/system
      }
    }
    await mongoose.disconnect();
  } catch (err) {
    console.error("Error:", err);
  }
}

run();
