import mongoose from 'mongoose';

async function main() {
  try {
    await mongoose.connect('mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin');
    const db = mongoose.connection.db;
    
    console.log("Searching for successful transactions of Spider-Man...");
    const spidermanTx = await db.collection("transactions")
      .find({
        movieId: new mongoose.Types.ObjectId("6a5ba965bb1d9a7721cc612a"),
        paymentsStatus: true
      })
      .toArray();

    console.log(`Found ${spidermanTx.length} successful Spider-Man transactions.`);
    
    spidermanTx.forEach(tx => {
      console.log("\n--------------------------------");
      console.log("ID:", tx._id);
      console.log("initTransId:", tx.initTransId);
      console.log("paymentResponse.amount:", tx.paymentResponse?.amount);
      console.log("finalBookingCalculation.finalAmount:", tx.finalBookingCalculation?.finalAmount);
      console.log("finalBookingCalculation.ticketCart:", JSON.stringify(tx.finalBookingCalculation?.ticketCart, null, 2));
      console.log("commitBookingData.strSeatInfo:", tx.commitBookingData?.strSeatInfo);
      console.log("commitBookingData.curTicketsTax3:", tx.commitBookingData?.curTicketsTax3);
      console.log("addSeatData.curTicketsTax3:", tx.addSeatData?.curTicketsTax3);
    });

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

main();
