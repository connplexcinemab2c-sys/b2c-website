import mongoose from 'mongoose';

async function main() {
  try {
    await mongoose.connect('mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin');
    const db = mongoose.connection.db;
    
    console.log("Fetching latest successful transactions...");
    const txs = await db.collection("transactions")
      .find({ paymentsStatus: true, commitStatus: true })
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray();

    txs.forEach((tx, idx) => {
      console.log(`\n================ TRANSACTION #${idx + 1} ================`);
      console.log("ID:", tx._id);
      console.log("createdAt:", tx.createdAt);
      console.log("status:", tx.status);
      console.log("paymentsBreakup:", JSON.stringify(tx.paymentsBreakup, null, 2));
      console.log("finalBookingCalculation keys:", tx.finalBookingCalculation ? Object.keys(tx.finalBookingCalculation) : null);
      if (tx.finalBookingCalculation) {
        console.log("finalBookingCalculation.ticketCart:", JSON.stringify(tx.finalBookingCalculation.ticketCart, null, 2));
        console.log("finalBookingCalculation.rewardCoinsRedeemed:", tx.finalBookingCalculation.rewardCoinsRedeemed);
        console.log("finalBookingCalculation.rewardDiscountApplied:", tx.finalBookingCalculation.rewardDiscountApplied);
        console.log("finalBookingCalculation.finalAmount:", tx.finalBookingCalculation.finalAmount);
        console.log("finalBookingCalculation.totalDiscount:", tx.finalBookingCalculation.totalDiscount);
      }
    });

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

main();
