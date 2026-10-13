import mongoose from 'mongoose';
import { movieSync, showSync } from './src/controller/admin/CinemaWiseDataSync.js';

async function main() {
  await mongoose.connect('mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin');
  console.log('Connected to MongoDB');

  const cid = 'CN01';
  console.log(`Running movieSync for ${cid}...`);
  await movieSync(cid);
  console.log(`Running showSync for ${cid}...`);
  const showsAdded = await showSync(cid);
  console.log(`Shows added/synced:`, showsAdded);

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

  await mongoose.disconnect();
}

main().catch(console.error);
