import mongoose from 'mongoose';
import { buildMultiPaymentDetails } from '../Backend/src/services/vistaServices/VistaPaymentHelper.js';

async function run() {
  await mongoose.connect('mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin');
  const db = mongoose.connection.db;

  const tx = await db.collection('transactions').findOne({ initTransId: '20000002924' });
  console.log('TX addSeatData:', tx.addSeatData);
  console.log('TX finalBookingCalculation:', tx.finalBookingCalculation);

  // Note: on the server, process.env.ENABLE_VISTA_DISCOUNT_TENDER is true or false?
  process.env.ENABLE_VISTA_DISCOUNT_TENDER = 'true';
  process.env.VISTA_DISCOUNT_PAYTYPE = 'DISC';

  const resWithDisc = buildMultiPaymentDetails({
    finalBooking: tx.finalBookingCalculation,
    addSeatData: tx.addSeatData,
    foodAndBvgResponse: tx.foodAndBvgResponse,
    vistaOrderUpdated: tx.vistaOrderUpdated === true,
  });
  console.log('\nWith ENABLE_VISTA_DISCOUNT_TENDER=true:');
  console.log(resWithDisc);

  process.env.ENABLE_VISTA_DISCOUNT_TENDER = 'false';
  const resWithoutDisc = buildMultiPaymentDetails({
    finalBooking: tx.finalBookingCalculation,
    addSeatData: tx.addSeatData,
    foodAndBvgResponse: tx.foodAndBvgResponse,
    vistaOrderUpdated: tx.vistaOrderUpdated === true,
  });
  console.log('\nWith ENABLE_VISTA_DISCOUNT_TENDER=false:');
  console.log(resWithoutDisc);

  await mongoose.disconnect();
}

run().catch(console.error);
