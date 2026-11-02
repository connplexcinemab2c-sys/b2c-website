import mongoose from 'mongoose';
import { buildMultiPaymentDetails } from '../Backend/src/services/vistaServices/VistaPaymentHelper.js';

async function run() {
  await mongoose.connect('mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin');
  const db = mongoose.connection.db;

  const start = new Date('2026-11-01T00:00:00.000+05:30');
  const end = new Date('2026-11-01T23:59:59.999+05:30');

  const s1Sample = await db.collection('transactions').findOne({
    status: 1,
    createdAt: { $gte: start, $lte: end }
  });

  const s4Sample = await db.collection('transactions').findOne({
    status: 4,
    createdAt: { $gte: start, $lte: end }
  });

  console.log('=== STATUS 1 SAMPLE ===');
  console.log('CinemaId:', s1Sample.cinemaId);
  console.log('finalBookingCalculation:', JSON.stringify(s1Sample.finalBookingCalculation, null, 2));
  console.log('commitBookingData:', JSON.stringify(s1Sample.commitBookingData, null, 2));
  try {
    const s1MP = buildMultiPaymentDetails({
      finalBooking: s1Sample.finalBookingCalculation,
      addSeatData: s1Sample.addSeatData,
      foodAndBvgResponse: s1Sample.foodAndBvgResponse,
      vistaOrderUpdated: s1Sample.vistaOrderUpdated === true,
    });
    console.log('Status 1 MultiPayment:', s1MP);
  } catch (e) {
    console.log('Status 1 MP Error:', e.message);
  }

  console.log('\n=== STATUS 4 SAMPLE ===');
  console.log('CinemaId:', s4Sample.cinemaId);
  console.log('finalBookingCalculation:', JSON.stringify(s4Sample.finalBookingCalculation, null, 2));
  console.log('vistaErrorResponse:', JSON.stringify(s4Sample.vistaErrorResponse, null, 2));
  try {
    const s4MP = buildMultiPaymentDetails({
      finalBooking: s4Sample.finalBookingCalculation,
      addSeatData: s4Sample.addSeatData,
      foodAndBvgResponse: s4Sample.foodAndBvgResponse,
      vistaOrderUpdated: s4Sample.vistaOrderUpdated === true,
    });
    console.log('Status 4 MultiPayment:', s4MP);
  } catch (e) {
    console.log('Status 4 MP Error:', e.message);
  }

  await mongoose.disconnect();
}

run();
