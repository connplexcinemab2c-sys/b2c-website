import mongoose from 'mongoose';

async function run() {
  try {
    await mongoose.connect('mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin');
    const db = mongoose.connection.db;

    const tx = await db.collection('transactions').findOne({
      _id: new mongoose.Types.ObjectId('6abd3cdd7702fe7926a79269')
    });

    console.log("=== TRANSACTION FULL DETAILS ===");
    console.log("Tx ID:", tx._id);
    console.log("initTransId:", tx.initTransId);
    console.log("createdAt:", tx.createdAt);
    console.log("createdAt IST:", new Date(new Date(tx.createdAt).getTime() + 5.5*3600*1000).toLocaleString('en-IN'));
    console.log("status:", tx.status, "paymentsStatus:", tx.paymentsStatus, "commitStatus:", tx.commitStatus);
    console.log("movieId:", tx.movieId);
    console.log("showId:", tx.showId);
    console.log("cinemaId:", tx.cinemaId);
    console.log("movieData:", tx.movieData);
    console.log("showData:", tx.showData);
    console.log("cinemaData:", tx.cinemaData);
    console.log("addSeatData:", JSON.stringify(tx.addSeatData, null, 2));
    console.log("commitBookingData:", JSON.stringify(tx.commitBookingData, null, 2));
    console.log("finalBookingCalculation:", JSON.stringify(tx.finalBookingCalculation, null, 2));
    console.log("paymentResponse:", tx.paymentResponse);

    // Also look up showId
    if (tx.showId) {
      const show = await db.collection('shows').findOne({ _id: tx.showId });
      console.log("\n=== SHOW DOCUMENT ===");
      console.log(JSON.stringify(show, null, 2));
    }

    // Check if there are other transactions for this show or for Avengers at Tribeca
    const otherTx = await db.collection('transactions').find({
      cinemaId: tx.cinemaId,
      showId: tx.showId
    }).toArray();
    console.log(`\nTransactions for this same show: ${otherTx.length}`);
    for (const ot of otherTx) {
      console.log(ot._id, ot.createdAt, ot.status, ot.finalBookingCalculation?.ticketCart?.ticketTotal, ot.commitBookingData?.strBookId);
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

run();
