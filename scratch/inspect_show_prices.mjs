import mongoose from 'mongoose';

async function run() {
  try {
    await mongoose.connect('mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin');
    const db = mongoose.connection.db;

    // Check TX 20000040384 (Adani Shantigram, showId, session)
    const tx = await db.collection('transactions').findOne({ initTransId: '20000040384' });
    console.log("=== TX 20000040384 ===");
    console.log("addSeatData:", tx.addSeatData);
    console.log("setSeatData:", tx.setSeatData);
    console.log("finalBookingCalculation:", tx.finalBookingCalculation);

    const show = await db.collection('shows').findOne({ _id: tx.showId });
    console.log("\nShow:", show);

    // Look at price package or price in db
    if (show && show.pGroupObjectId) {
      const pricePkg = await db.collection('pricepackages').findOne({ _id: show.pGroupObjectId });
      console.log("\nPricePackage:", pricePkg);
    }

    const prices = await db.collection('prices').find({
      cinemaId: tx.cinemaId,
      showId: tx.showId
    }).toArray();
    console.log("\nPrices in DB:", prices);

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

run();
