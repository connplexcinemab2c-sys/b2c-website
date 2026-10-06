import mongoose from 'mongoose';

async function run() {
  try {
    await mongoose.connect('mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin');
    const db = mongoose.connection.db;

    const start = new Date('2026-10-01T00:00:00.000+05:30');
    const end = new Date('2026-10-04T23:59:59.999+05:30');

    const status4Txs = await db.collection('transactions').find({
      deletedStatus: 0,
      createdAt: { $gte: start, $lte: end },
      status: 4
    }).toArray();

    console.log(`Checking exact session + seat collisions in Oct 2026 for ${status4Txs.length} Status 4 transactions...\n`);

    let sameSessionCollision = 0;
    for (const t of status4Txs) {
      const seats = t.addSeatData?.strSeatInfo || t.setSeatData?.strSeatInfo;
      const sessId = t.paymentResponse?.notes?.sessionId || t.addSeatData?.lngSessionId || t.setSeatData?.lngSessionId;
      const cinemaId = t.cinemaId;

      if (seats && sessId && cinemaId) {
        // Find if another transaction for the SAME cinemaId and SAME session booked the same seats in Oct 2026
        const colliding = await db.collection('transactions').find({
          _id: { $ne: t._id },
          cinemaId: cinemaId,
          createdAt: { $gte: new Date('2026-09-30T00:00:00.000Z'), $lte: new Date('2026-10-05T23:59:59.999Z') },
          $and: [
            {
              $or: [
                { "paymentResponse.notes.sessionId": String(sessId) },
                { "addSeatData.lngSessionId": Number(sessId) },
                { "addSeatData.lngSessionId": String(sessId) },
                { "setSeatData.lngSessionId": Number(sessId) },
                { "setSeatData.lngSessionId": String(sessId) }
              ]
            },
            {
              $or: [
                { "addSeatData.strSeatInfo": seats },
                { "setSeatData.strSeatInfo": seats },
                { "commitBookingData.strSeatInfo": seats }
              ]
            }
          ]
        }).toArray();

        if (colliding.length > 0) {
          sameSessionCollision++;
          console.log(`Colliding TX found for ${t.initTransId} (Cinema: ${cinemaId}, Session: ${sessId}, Seats: ${seats}, Status: 4, Created: ${t.createdAt.toISOString()}):`);
          for (const c of colliding) {
            console.log(`  -> Collided with TX ${c.initTransId}, Status: ${c.status}, CreatedAt: ${c.createdAt.toISOString()}, CommitBookId: ${c.commitBookingData?.strBookId || 'none'}`);
          }
        }
      }
    }

    console.log(`\nTotal exact cinema + session + seat collisions: ${sameSessionCollision}`);

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

run();
