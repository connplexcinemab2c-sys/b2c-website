import mongoose from 'mongoose';

async function main() {
  try {
    await mongoose.connect('mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin');
    const db = mongoose.connection.db;
    
    const bookingIds = ["WQF8DXN", "WTHRB5F", "WXPJLXT", "WQ84X2C"];
    console.log("Fetching details for:", bookingIds);

    for (const bid of bookingIds) {
      const tx = await db.collection("transactions").findOne({
        $or: [
          { "addSeatData.strBookId": bid },
          { "commitBookingData.strBookId": bid }
        ]
      });

      if (tx) {
        console.log("\n==================================");
        console.log("Booking ID:", bid);
        console.log("initTransId:", tx.initTransId);
        console.log("paymentsStatus:", tx.paymentsStatus);
        console.log("commitStatus:", tx.commitStatus);
        console.log("commitBookingData.strSeatInfo:", tx.commitBookingData?.strSeatInfo);
        console.log("commitBookingData.curTicketsTax3:", tx.commitBookingData?.curTicketsTax3);
        console.log("addSeatData.strSeatInfo:", tx.addSeatData?.strSeatInfo);
        console.log("addSeatData.curTicketsTax3:", tx.addSeatData?.curTicketsTax3);
        console.log("setSeatData.strSeatInfo:", tx.setSeatData?.strSeatInfo);
        console.log("setSeatData.curTicketsTax3:", tx.setSeatData?.curTicketsTax3);
        console.log("finalBookingCalculation.finalAmount:", tx.finalBookingCalculation?.finalAmount);
        console.log("paymentResponse.amount:", tx.paymentResponse?.amount);
        
        const movie = await db.collection("movies").findOne({ _id: tx.movieId });
        if (movie) {
          console.log("Movie Name:", movie.name);
          console.log("Movie Type:", movie.movieType);
        }
      } else {
        console.log(`Booking ID ${bid} not found.`);
      }
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

main();
