import mongoose from 'mongoose';

async function main() {
  try {
    await mongoose.connect('mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin');
    const db = mongoose.connection.db;
    
    console.log("Fetching transaction for WTHRB5F...");
    const tx = await db.collection("transactions").findOne({
      $or: [
        { "addSeatData.strBookId": "WTHRB5F" },
        { "commitBookingData.strBookId": "WTHRB5F" }
      ]
    });

    if (tx) {
      console.log("Found Transaction:");
      console.log("ID:", tx._id);
      console.log("initTransId:", tx.initTransId);
      console.log("paymentsStatus:", tx.paymentsStatus);
      console.log("commitStatus:", tx.commitStatus);
      console.log("commitBookingData:", JSON.stringify(tx.commitBookingData, null, 2));
      console.log("addSeatData:", JSON.stringify(tx.addSeatData, null, 2));
      console.log("finalBookingCalculation:", JSON.stringify(tx.finalBookingCalculation, null, 2));
      console.log("paymentResponse:", JSON.stringify(tx.paymentResponse, null, 2));
      
      const movie = await db.collection("movies").findOne({ _id: tx.movieId });
      if (movie) {
        console.log("Movie Name:", movie.name);
        console.log("Movie Type:", movie.movieType);
      }
    } else {
      console.log("Transaction WTHRB5F not found.");
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

main();
