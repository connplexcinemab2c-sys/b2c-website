import mongoose from 'mongoose';

async function main() {
  try {
    await mongoose.connect('mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin');
    const db = mongoose.connection.db;
    
    console.log("Fetching one successful transaction with complete booking data...");
    const tx = await db.collection("transactions").findOne({
      paymentsStatus: true,
      commitStatus: true,
      commitBookingData: { $exists: true, $ne: null }
    });

    if (tx) {
      console.log("commitBookingData:", JSON.stringify(tx.commitBookingData, null, 2));
      console.log("addSeatData:", JSON.stringify(tx.addSeatData, null, 2));
      console.log("setSeatData:", JSON.stringify(tx.setSeatData, null, 2));
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

main();
