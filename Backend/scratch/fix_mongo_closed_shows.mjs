import mongoose from 'mongoose';

const MONGO_URL = 'mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin';

async function fixClosedShows() {
  await mongoose.connect(MONGO_URL);
  const db = mongoose.connection.db;

  const now = new Date();
  const res = await db.collection('shows').updateMany(
    {
      sessionRealShow: { $gte: now },
      screenStatus: 'C',
      sessionSeatsAvail: { $gt: 0 },
      deletedStatus: 0
    },
    {
      $set: {
        screenStatus: 'O',
        updatedAt: new Date()
      }
    }
  );

  console.log(`Updated ${res.modifiedCount} shows from status 'C' to 'O'.`);

  const todayRes = await db.collection('todayshows').updateMany(
    {
      sessionRealShow: { $gte: now },
      screenStatus: 'C',
      sessionSeatsAvail: { $gt: 0 },
      deletedStatus: 0
    },
    {
      $set: {
        screenStatus: 'O',
        updatedAt: new Date()
      }
    }
  );

  console.log(`Updated ${todayRes.modifiedCount} todayshows from status 'C' to 'O'.`);

  await mongoose.disconnect();
}

fixClosedShows().catch(console.error);
