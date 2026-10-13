import mongoose from 'mongoose';
import { movieSync, showSync } from './src/controller/admin/CinemaWiseDataSync.js';

async function syncCinema(cid) {
  console.log(`\n================== Syncing ${cid} ==================`);
  await movieSync(cid);
  const showsAdded = await showSync(cid);
  console.log(`showSync done for ${cid}, newly added:`, showsAdded);

  const activeShows = await mongoose.connection.db.collection('shows').countDocuments({
    cinemaId: cid,
    isActive: true,
    deletedStatus: 0
  });
  console.log(`Active shows now in DB for ${cid}:`, activeShows);

  const now = new Date();
  const futureShows = await mongoose.connection.db.collection('shows').countDocuments({
    cinemaId: cid,
    isActive: true,
    deletedStatus: 0,
    sessionRealShow: { $gte: now }
  });
  console.log(`Future shows now in DB for ${cid}:`, futureShows);
}

async function main() {
  await mongoose.connect('mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin');
  const db = mongoose.connection.db;

  // 1. Activate Junagadh region and cinema
  console.log('Activating Junagadh region and cinema CN44...');
  const rResult = await db.collection('regions').updateOne(
    { _id: new mongoose.Types.ObjectId('6a4670734a5d2aee11b1bd65') },
    { $set: { isActive: true } }
  );
  const cResult = await db.collection('cinemas').updateOne(
    { cinemaId: 'CN44' },
    { $set: { isActive: true } }
  );
  console.log('Region update modifiedCount:', rResult.modifiedCount);
  console.log('Cinema update modifiedCount:', cResult.modifiedCount);

  // 2. Sync CN26 (Madhubani)
  await syncCinema('CN26');

  // 3. Sync CN35 (Mundra)
  await syncCinema('CN35');

  // 4. Sync CN44 (Junagadh)
  await syncCinema('CN44');

  await mongoose.disconnect();
}

main().catch(console.error);
