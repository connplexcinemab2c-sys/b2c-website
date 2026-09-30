import mongoose from 'mongoose';

async function run() {
  try {
    await mongoose.connect('mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin');
    const db = mongoose.connection.db;

    // Deactivate Session 4911 in shows collection
    const showRes = await db.collection('shows').updateOne(
      { sessionId: 4911, cinemaId: 'CN39' },
      { $set: { isActive: false, deletedStatus: 1, updatedAt: new Date() } }
    );
    console.log("Updated shows collection:", showRes);

    // Deactivate in todayshows if exists
    const todayRes = await db.collection('todayshows').updateMany(
      { sessionId: 4911, cinemaId: 'CN39' },
      { $set: { isActive: false, deletedStatus: 1, updatedAt: new Date() } }
    );
    console.log("Updated todayshows collection:", todayRes);

    // Verify
    const verifyShow = await db.collection('shows').findOne({ sessionId: 4911, cinemaId: 'CN39' });
    console.log("Verified Session 4911:", {
      sessionId: verifyShow.sessionId,
      cinemaId: verifyShow.cinemaId,
      isActive: verifyShow.isActive,
      deletedStatus: verifyShow.deletedStatus
    });

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

run();
