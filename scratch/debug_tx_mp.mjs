import mongoose from 'mongoose';
import { buildMultiPaymentDetails } from '../Backend/src/services/vistaServices/VistaPaymentHelper.js';

async function run() {
  await mongoose.connect('mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin');
  const db = mongoose.connection.db;

  const tx = await db.collection('transactions').findOne({ initTransId: "20000232121" });

  console.log("=== Transaction 20000232121 ===");
  console.log("addSeatData:", JSON.stringify(tx.addSeatData, null, 2));
  console.log("foodAndBvgResponse:", JSON.stringify(tx.foodAndBvgResponse, null, 2));
  console.log("finalBookingCalculation:", JSON.stringify(tx.finalBookingCalculation, null, 2));

  const mpResult = buildMultiPaymentDetails({
    finalBooking: tx.finalBookingCalculation,
    addSeatData: tx.addSeatData,
    foodAndBvgResponse: tx.foodAndBvgResponse,
    vistaOrderUpdated: tx.vistaOrderUpdated === true,
  });

  console.log("\n=== MultiPaymentDetails Result ===");
  console.log(JSON.stringify(mpResult, null, 2));

  await mongoose.disconnect();
}

run();
