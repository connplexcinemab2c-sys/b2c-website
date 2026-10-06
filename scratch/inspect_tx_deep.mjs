import mongoose from 'mongoose';

async function run() {
  try {
    await mongoose.connect('mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin');
    const db = mongoose.connection.db;

    const tx = await db.collection('transactions').findOne({ initTransId: '20000233315' });
    console.log("=== TX 20000233315 (Bhagalpur) ===");
    console.log(JSON.stringify(tx, null, 2));

    const show = await db.collection('shows').findOne({ _id: tx.showId });
    console.log("\n=== SHOW ===");
    console.log(show);

    const cinema = await db.collection('cinemas').findOne({ _id: tx.cinemaId });
    console.log("\n=== CINEMA ===");
    console.log({
      cinemaName: cinema.cinemaName,
      cinemaId: cinema.cinemaId,
      cinemaWebServiceUrl: cinema.cinemaWebServiceUrl,
      cinemaLicenseNumber: cinema.cinemaLicenseNumber
    });

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

run();
