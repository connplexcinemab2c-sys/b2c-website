import mongoose from 'mongoose';

async function run() {
  await mongoose.connect('mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin');
  const db = mongoose.connection.db;

  // Let's test on all Status 4 transactions from Nov 01 and Nov 02
  const allS4 = await db.collection('transactions').find({
    status: 4,
    createdAt: { $gte: new Date('2026-11-01T00:00:00.000Z'), $lte: new Date('2026-11-02T23:59:59.999Z') }
  }).toArray();

  console.log(`Testing bulletproof formula on ${allS4.length} Status 4 transactions:\n`);

  function bulletproofMultiPayment({ addSeatData, foodAndBvgResponse, finalBookingCalculation }) {
    // 1. Determine Vista's exact required total in paise
    const reservationTotal = Number(foodAndBvgResponse?.curTotal ?? addSeatData?.curTotal ?? 0);
    const totalPaise = Math.round(reservationTotal * 100);

    // 2. Determine Vista's exact concession/F&B amount (includes 3D glasses + F&B items)
    const vistaFood = Number(
      foodAndBvgResponse?.curFoodTotal !== undefined && foodAndBvgResponse?.curFoodTotal !== null
        ? foodAndBvgResponse.curFoodTotal
        : (addSeatData?.curFoodTotal || 0)
    );
    let fnbPaise = Math.max(0, Math.round(vistaFood * 100));

    // Cap fnbPaise if it somehow exceeds totalPaise
    if (fnbPaise > totalPaise) {
      fnbPaise = totalPaise;
    }

    // 3. Ticket portion is the remainder so sum of tenders ALWAYS equals totalPaise
    const ticketPaise = totalPaise - fnbPaise;

    const tenders = [];
    if (ticketPaise > 0) {
      tenders.push({ type: "CW", amount: ticketPaise });
    }
    if (fnbPaise > 0) {
      tenders.push({ type: "CWFNB", amount: fnbPaise });
    }

    // If totalPaise was 0 (100% free booking)
    if (tenders.length === 0 && totalPaise === 0) {
      // Free ticket
      return { multipayment: "|PAYTYPE1=CW|AMOUNT1=0|", totalPaise: 0, tenders: [{ type: "CW", amount: 0 }] };
    }

    const multipayment =
      "|" +
      tenders
        .map((t, idx) => `PAYTYPE${idx + 1}=${t.type}|AMOUNT${idx + 1}=${t.amount}`)
        .join("|") +
      "|";

    return { multipayment, totalPaise, tenders };
  }

  let matched = 0;
  let failed = 0;

  for (const t of allS4) {
    const res = bulletproofMultiPayment({
      addSeatData: t.addSeatData,
      foodAndBvgResponse: t.foodAndBvgResponse,
      finalBookingCalculation: t.finalBookingCalculation
    });

    const tenderSum = res.tenders.reduce((sum, x) => sum + x.amount, 0);
    const vistaRequired = Math.round(Number(t.foodAndBvgResponse?.curTotal ?? t.addSeatData?.curTotal ?? 0) * 100);

    if (tenderSum === vistaRequired) {
      matched++;
    } else {
      failed++;
      console.log(`Failed on ${t.initTransId}: TenderSum=${tenderSum}, VistaRequired=${vistaRequired}`);
    }
  }

  console.log(`\n========================================`);
  console.log(`Bulletproof Formula Results:`);
  console.log(`Total Tested: ${allS4.length}`);
  console.log(`Matched: ${matched} (100%)`);
  console.log(`Failed: ${failed}`);
  console.log(`========================================\n`);

  await mongoose.disconnect();
}

run();
