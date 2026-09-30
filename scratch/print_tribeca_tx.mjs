import mongoose from 'mongoose';

async function run() {
  try {
    await mongoose.connect('mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin');
    const db = mongoose.connection.db;

    const cinemas = await db.collection('cinemas').find({
      $or: [
        { name: /tribeca|pune/i },
        { cinemaName: /tribeca|pune/i }
      ]
    }).toArray();
    const tribecaIds = cinemas.map(c => c._id);

    const txs = await db.collection('transactions').find({
      cinemaId: { $in: tribecaIds },
      $or: [
        { "movieData.name": /avenger/i },
        { "showData.sessionRealShow": { $exists: true } }
      ],
      createdAt: { $gte: new Date("2026-09-28T00:00:00.000Z") }
    }).sort({ createdAt: -1 }).toArray();

    console.log(`Found ${txs.length} transactions at Pune Tribeca since Sept 28:`);
    for (const t of txs) {
      const show = t.showId ? await db.collection('shows').findOne({ _id: t.showId }) : null;
      console.log("==================================================");
      console.log(`Tx ID: ${t._id} | InitTransId: ${t.initTransId}`);
      console.log(`CreatedAt: ${t.createdAt} (IST: ${new Date(new Date(t.createdAt).getTime() + 5.5*3600*1000).toLocaleString('en-IN')})`);
      console.log(`Status: ${t.status} (paymentsStatus: ${t.paymentsStatus}, commitStatus: ${t.commitStatus})`);
      console.log(`Movie: ${t.movieData?.name || show?.filmCode}`);
      console.log(`ShowId: ${t.showId}`);
      console.log(`Show in ShowDoc: SessionId: ${show?.sessionId} | RealShow UTC: ${show?.sessionRealShow} | Screen: ${show?.screenName}`);
      console.log(`Show in Tx.showData:`, t.showData);
      console.log(`Seats: ${t.commitBookingData?.strSeatInfo || t.addSeatData?.strSeatInfo}`);
      console.log(`Amount: ${t.finalBookingCalculation?.ticketCart?.ticketTotal}`);
      console.log(`PaymentResponse notes:`, t.paymentResponse?.notes);
      console.log(`PaymentResponse: id=${t.paymentResponse?.id}, status=${t.paymentResponse?.status}, contact=${t.paymentResponse?.contact}`);
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

run();
