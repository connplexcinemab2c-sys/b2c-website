import mongoose from 'mongoose';

const MONGO_URL = 'mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin';

async function check() {
  await mongoose.connect(MONGO_URL);
  const db = mongoose.connection.db;

  const syncedCinemas = await db.collection('cinemas').find({
    lastVistaDbSync: { $exists: true }
  }).toArray();

  console.log(`Cinemas with lastVistaDbSync: ${syncedCinemas.length}`);
  for (const c of syncedCinemas) {
    console.log(`  [${c.cinemaId}] ${c.displayName || c.cinemaName} -> ${c.lastVistaDbSync?.toISOString()} (Success: ${c.lastVistaDbSyncStatus})`);
  }

  await mongoose.disconnect();
}

check().catch(console.error);
