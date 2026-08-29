import mongoose from 'mongoose';

async function main() {
  try {
    await mongoose.connect('mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin');
    const db = mongoose.connection.db;
    
    console.log("Fetching transactions with non-empty seatInfo...");
    const txs = await db.collection("transactions")
      .find({
        paymentsStatus: true,
        $or: [
          { "commitBookingData.strSeatInfo": { $exists: true, $ne: "" } },
          { "addSeatData.strSeatInfo": { $exists: true, $ne: "" } }
        ]
      })
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray();

    txs.forEach((tx, idx) => {
      console.log(`\n================ TRANSACTION #${idx + 1} ================`);
      console.log("ID:", tx._id);
      console.log("commitBookingData.strSeatInfo:", tx.commitBookingData?.strSeatInfo);
      console.log("addSeatData.strSeatInfo:", tx.addSeatData?.strSeatInfo);
      console.log("commitBookingData.curTicketsTax3:", tx.commitBookingData?.curTicketsTax3);
      console.log("addSeatData.curTicketsTax3:", tx.addSeatData?.curTicketsTax3);
    });

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

main();
