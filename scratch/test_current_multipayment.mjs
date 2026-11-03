import mongoose from 'mongoose';
import { buildMultiPaymentDetails } from '../Backend/src/services/vistaServices/VistaPaymentHelper.js';

async function run() {
  await mongoose.connect('mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin');
  const db = mongoose.connection.db;

  const utcStart = new Date('2026-11-02T00:00:00.000Z');
  const utcEnd = new Date('2026-11-02T23:59:59.999Z');

  const s4Txs = await db.collection('transactions').find({
    status: 4,
    createdAt: { $gte: utcStart, $lte: utcEnd }
  }).toArray();

  console.log(`Checking buildMultiPaymentDetails for all ${s4Txs.length} Status 4 transactions:\n`);

  let perfectMatch = 0;
  let mismatch = 0;

  for (const t of s4Txs) {
    const res = buildMultiPaymentDetails({
      finalBooking: t.finalBookingCalculation,
      addSeatData: t.addSeatData,
      foodAndBvgResponse: t.foodAndBvgResponse,
      vistaOrderUpdated: t.vistaOrderUpdated === true,
    });

    const matches = [...res.multipayment.matchAll(/AMOUNT\d+=(\d+)/g)];
    const totalTenderPaise = matches.reduce((sum, m) => sum + parseInt(m[1]), 0);
    const vistaRequiredPaise = Math.round(Number(t.foodAndBvgResponse?.curTotal ?? t.addSeatData?.curTotal ?? 0) * 100);

    const diff = totalTenderPaise - vistaRequiredPaise;

    if (diff === 0) {
      perfectMatch++;
    } else {
      mismatch++;
      console.log(`MISMATCH on Tx ${t.initTransId}:`);
      console.log(`   Vista curTotal: ₹${t.foodAndBvgResponse?.curTotal ?? t.addSeatData?.curTotal} (${vistaRequiredPaise} paise)`);
      console.log(`   Multipayment: ${res.multipayment} (${totalTenderPaise} paise)`);
      console.log(`   Diff: ${diff} paise (₹${diff / 100})`);
      console.log('----------------------------------------------------');
    }
  }

  console.log(`\nResults with NEW buildMultiPaymentDetails: Perfect Matches = ${perfectMatch} / ${s4Txs.length}, Mismatches = ${mismatch}`);

  await mongoose.disconnect();
}

run();
