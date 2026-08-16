import mongoose from 'mongoose';

async function main() {
  try {
    await mongoose.connect('mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin');
    const db = mongoose.connection.db;
    
    console.log("Searching for transactions with 3D or glass related fields in finalBookingCalculation...");
    // Let's search inside finalBookingCalculation
    const sampleWith3D = await db.collection("transactions").findOne({
      $or: [
        { "finalBookingCalculation.ticketCart.threeDCharges": { $exists: true } },
        { "finalBookingCalculation.ticketCart.threeDCharge": { $exists: true } },
        { "finalBookingCalculation.ticketCart.3d": { $exists: true } },
        { "finalBookingCalculation.ticketCart.glasses": { $exists: true } },
        { "finalBookingCalculation.ticketCart.additional": { $exists: true } },
        { "finalBookingCalculation.threeDCharge": { $exists: true } }
      ]
    });

    if (sampleWith3D) {
      console.log("Found transaction with 3D fields:");
      console.log(JSON.stringify(sampleWith3D.finalBookingCalculation, null, 2));
    } else {
      console.log("No explicit 3D field found in finalBookingCalculation with those names.");
      // Let's print keys of one transaction's finalBookingCalculation.ticketCart to see what's in there
      const tx = await db.collection("transactions").findOne({ "finalBookingCalculation.ticketCart": { $exists: true } });
      if (tx) {
        console.log("TicketCart keys:", Object.keys(tx.finalBookingCalculation.ticketCart));
        console.log("TicketCart sample:", JSON.stringify(tx.finalBookingCalculation.ticketCart, null, 2));
      }
    }

    // Let's search if any transaction has "glasses" or "3D" anywhere in addSeatData, setSeatData, etc.
    const sampleGeneric = await db.collection("transactions").findOne({
      $or: [
        { "addSeatData.threeDCharges": { $exists: true } },
        { "addSeatData.threeDCharge": { $exists: true } },
        { "addSeatData.3d": { $exists: true } }
      ]
    });
    if (sampleGeneric) {
      console.log("Found in addSeatData:", JSON.stringify(sampleGeneric.addSeatData, null, 2));
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

main();
