import mongoose from 'mongoose';

async function run() {
  await mongoose.connect('mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin');
  const db = mongoose.connection.db;

  const start = new Date('2026-11-01T00:00:00.000+05:30');
  const end = new Date('2026-11-01T23:59:59.999+05:30');

  const s4Txs = await db.collection('transactions').find({
    status: 4,
    createdAt: { $gte: start, $lte: end }
  }).toArray();

  console.log(`Testing formula on ${s4Txs.length} Status 4 transactions:`);

  let matched = 0;
  for (const t of s4Txs) {
    const grossTicket =
      Number(t.addSeatData?.grossTicketsTotal) ||
      Number(t.finalBookingCalculation?.ticketCart?.ticketTotal) ||
      Number(t.addSeatData?.curTicketsTotal) ||
      Number(t.addSeatData?.curTotal) ||
      0;
    const ticketGrossPaise = Math.round(grossTicket * 100);

    const addSeatFood = Number(t.addSeatData?.curFoodTotal) || 0;
    const separateFood =
      Number(t.foodAndBvgResponse?.curFoodTotal) ||
      Number(t.finalBookingCalculation?.foodCart?.basePrice) ||
      Number(t.finalBookingCalculation?.foodCart?.total) ||
      0;
    const foodAmount = addSeatFood + separateFood;
    const fnbPaise = foodAmount > 0 ? Math.round(foodAmount * 100) : 0;

    const totalTenderPaise = ticketGrossPaise + fnbPaise;
    const vistaExpectedPaise = Math.round(Number(t.addSeatData?.curTotal || 0) * 100);

    const diff = totalTenderPaise - vistaExpectedPaise;
    if (diff === 0) {
      matched++;
    } else {
      console.log(`MISMATCH for TX ${t.initTransId}: Tender=${totalTenderPaise/100}, VistaExpected=${vistaExpectedPaise/100}, Diff=${diff/100}`);
    }
  }

  console.log(`\nMatched: ${matched} / ${s4Txs.length}`);

  await mongoose.disconnect();
}

run();
