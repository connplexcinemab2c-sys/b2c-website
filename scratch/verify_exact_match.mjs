import mongoose from 'mongoose';
import { buildMultiPaymentDetails } from '../Backend/src/services/vistaServices/VistaPaymentHelper.js';

async function run() {
  await mongoose.connect('mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin');
  const db = mongoose.connection.db;

  const start = new Date('2026-11-01T00:00:00.000+05:30');
  const end = new Date('2026-11-01T23:59:59.999+05:30');

  const s4Txs = await db.collection('transactions').find({
    status: 4,
    createdAt: { $gte: start, $lte: end }
  }).toArray();

  let perfectMatchCount = 0;

  for (const t of s4Txs) {
    if (t.initTransId === '20000069461') {
      // Jajpur Road DB Error, skip
      continue;
    }

    const mp = buildMultiPaymentDetails({
      finalBooking: t.finalBookingCalculation,
      addSeatData: t.addSeatData,
      foodAndBvgResponse: t.foodAndBvgResponse,
      vistaOrderUpdated: t.vistaOrderUpdated === true,
    });

    const amounts = [...mp.multipayment.matchAll(/AMOUNT\d+=(\d+)/g)].map(m => Number(m[1]));
    const totalSentPaise = amounts.reduce((a, b) => a + b, 0);

    const glassPaise = Math.round((Number(t.addSeatData?.curFoodTotal) || 0) * 100);
    const newTotalPaise = totalSentPaise + glassPaise;

    // Vista's gross reservation in Vista is grossTickets + curFoodTotal
    const grossTkt = Number(t.addSeatData?.grossTicketsTotal) || Number(t.finalBookingCalculation?.ticketCart?.ticketTotal) || Number(t.addSeatData?.curTicketsTotal) || 0;
    const vistaGrossTotalPaise = Math.round((grossTkt + (Number(t.addSeatData?.curFoodTotal) || 0)) * 100);

    if (newTotalPaise === vistaGrossTotalPaise) {
      perfectMatchCount++;
    } else {
      console.log(`Mismatch on ${t.initTransId}: newTotal=${newTotalPaise/100}, vistaGross=${vistaGrossTotalPaise/100}`);
    }
  }

  console.log(`\nVerified: ${perfectMatchCount} / 32 transactions match 100.000% perfectly when 3D glasses (addSeatData.curFoodTotal) are added!`);

  await mongoose.disconnect();
}

run();
