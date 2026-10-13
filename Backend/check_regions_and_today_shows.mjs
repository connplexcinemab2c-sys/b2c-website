import mongoose from 'mongoose';

async function main() {
  await mongoose.connect('mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin');
  const db = mongoose.connection.db;

  const cinemaIds = ['CN01', 'CN42', 'CN30', 'CN93', 'CN26', 'CN35', 'CN95', 'CN39', 'CN96', 'CN44'];
  const today = '2026-10-13';
  const startToday = new Date(`${today}T00:00:00.000Z`);
  const endToday = new Date(`${today}T23:59:59.999Z`);
  const now = new Date();

  console.log(`Current Time UTC: ${now.toISOString()}`);

  for (const cid of cinemaIds) {
    const cinema = await db.collection('cinemas').findOne({ cinemaId: cid });
    if (!cinema) {
      console.log(`Cinema ${cid} not found`);
      continue;
    }
    const region = await db.collection('regions').findOne({ _id: cinema.regionId });

    // Shows today
    const showsTodayAll = await db.collection('shows').countDocuments({
      cinemaObjectId: cinema._id,
      sessionRealShow: { $gte: startToday, $lte: endToday },
      screenStatus: { $ne: 'C' },
      deletedStatus: 0
    });
    const showsTodayActive = await db.collection('shows').countDocuments({
      cinemaObjectId: cinema._id,
      sessionRealShow: { $gte: startToday, $lte: endToday },
      screenStatus: { $ne: 'C' },
      isActive: true,
      deletedStatus: 0
    });
    const showsTodayFuture = await db.collection('shows').countDocuments({
      cinemaObjectId: cinema._id,
      sessionRealShow: { $gte: now, $lte: endToday },
      screenStatus: { $ne: 'C' },
      isActive: true,
      deletedStatus: 0
    });

    // Shows tomorrow (Oct 14)
    const startTomorrow = new Date('2026-10-14T00:00:00.000Z');
    const endTomorrow = new Date('2026-10-14T23:59:59.999Z');
    const showsTomorrowActive = await db.collection('shows').countDocuments({
      cinemaObjectId: cinema._id,
      sessionRealShow: { $gte: startTomorrow, $lte: endTomorrow },
      screenStatus: { $ne: 'C' },
      isActive: true,
      deletedStatus: 0
    });

    console.log('----------------------------------------------------');
    console.log(`${cid} | ${cinema.displayName || cinema.cinemaName}`);
    console.log(`  Region: "${region?.name}" (ID: ${cinema.regionId}) | Region isActive: ${region?.isActive}`);
    console.log(`  Cinema isActive: ${cinema.isActive} | deleted: ${cinema.deletedStatus} | poster: "${cinema.poster || ''}"`);
    console.log(`  Shows Today (Oct 13): Total: ${showsTodayAll} | Active: ${showsTodayActive} | Remaining Today (>= now): ${showsTodayFuture}`);
    console.log(`  Shows Tomorrow (Oct 14) Active: ${showsTomorrowActive}`);
  }

  await mongoose.disconnect();
}

main().catch(console.error);
