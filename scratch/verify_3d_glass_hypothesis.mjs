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

  console.log(`Checking curFoodTotal across all ${s4Txs.length} Status 4 transactions on Nov 01:`);

  let vistaFoodMismatchCount = 0;
  for (const t of s4Txs) {
    const vistaTotal = t.addSeatData?.curTotal;
    const vistaTicket = t.addSeatData?.curTicketsTotal;
    const vistaFood = t.addSeatData?.curFoodTotal;
    const appTicket = t.finalBookingCalculation?.ticketCart?.ticketTotal;
    const appFood = t.finalBookingCalculation?.foodCart?.fnbTotal;
    const seats = t.setSeatData?.strSeatInfo || t.addSeatData?.strSeatInfo;
    const seatCount = seats ? seats.split(',').length : 1;

    console.log(`TX: ${t.initTransId} | Seats: ${seatCount} | Vista(Total: ₹${vistaTotal}, Tkt: ₹${vistaTicket}, Food/Glass: ₹${vistaFood}) vs App(Tkt: ₹${appTicket}, Food: ₹${appFood})`);

    if (vistaFood > 0 && appFood === 0) {
      vistaFoodMismatchCount++;
    }
  }

  console.log(`\nTransactions with Vista Food/3D Glass mismatch: ${vistaFoodMismatchCount} / ${s4Txs.length}`);

  await mongoose.disconnect();
}

run();
