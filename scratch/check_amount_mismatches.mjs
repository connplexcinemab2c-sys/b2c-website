import mongoose from 'mongoose';
import { buildMultiPaymentDetails } from '../Backend/src/services/vistaServices/VistaPaymentHelper.js';

async function run() {
  try {
    await mongoose.connect('mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin');
    const db = mongoose.connection.db;

    const start = new Date('2026-10-01T00:00:00.000+05:30');
    const end = new Date('2026-10-04T23:59:59.999+05:30');

    const s4Txs = await db.collection('transactions').find({
      deletedStatus: 0,
      createdAt: { $gte: start, $lte: end },
      status: 4
    }).toArray();

    console.log(`Checking price / tender mismatch across all ${s4Txs.length} Status 4 transactions...\n`);

    let mismatchCount = 0;
    let matchCount = 0;
    const mismatchByCinema = {};

    const cinemas = await db.collection('cinemas').find({}).toArray();
    const cinemaMap = {};
    for (const c of cinemas) cinemaMap[c._id.toString()] = c.cinemaName;

    for (const t of s4Txs) {
      const vistaTotalPaise = Math.round(Number(t.addSeatData?.curTotal || t.addSeatData?.curTicketsTotal || 0) * 100);
      
      const { ticketGrossPaise, multipayment } = buildMultiPaymentDetails({
        finalBooking: t.finalBookingCalculation,
        addSeatData: t.addSeatData,
        foodAndBvgResponse: t.foodAndBvgResponse
      });

      // Sum amounts in multipayment
      const amounts = [...multipayment.matchAll(/AMOUNT\d+=(\d+)/g)].map(m => Number(m[1]));
      const totalMultipaymentPaise = amounts.reduce((a, b) => a + b, 0);

      // Compare
      const fnbPaise = Math.round(Number(t.finalBookingCalculation?.foodCart?.fnbTotal || 0) * 100);
      const expectedTotalInVista = vistaTotalPaise + fnbPaise;

      const cName = cinemaMap[t.cinemaId?.toString()] || 'Unknown';

      if (totalMultipaymentPaise !== expectedTotalInVista) {
        mismatchCount++;
        mismatchByCinema[cName] = (mismatchByCinema[cName] || 0) + 1;
        if (mismatchCount <= 10) {
          console.log(`MISMATCH in TX ${t.initTransId} (${cName}):`);
          console.log(`  Vista addSeat curTotal: ₹${vistaTotalPaise/100}`);
          console.log(`  Connplex finalBooking ticketTotal: ₹${t.finalBookingCalculation?.ticketCart?.ticketTotal}`);
          console.log(`  Multipayment sent: ${multipayment} (Total: ₹${totalMultipaymentPaise/100})`);
          console.log(`  Diff: ₹${(vistaTotalPaise - (totalMultipaymentPaise - fnbPaise))/100}\n`);
        }
      } else {
        matchCount++;
      }
    }

    console.log(`\n=== SUMMARY FOR STATUS 4 ===`);
    console.log(`Total Status 4: ${s4Txs.length}`);
    console.log(`Total with AMOUNT MISMATCH (Vista AddSeat total != Multipayment sent): ${mismatchCount}`);
    console.log(`Total matching: ${matchCount}`);
    console.log(`Mismatches by Cinema:`, mismatchByCinema);

    // Now check Status 1
    const s1Txs = await db.collection('transactions').find({
      deletedStatus: 0,
      createdAt: { $gte: start, $lte: end },
      status: 1
    }).toArray();

    let s1Mismatch = 0;
    let s1Match = 0;
    for (const t of s1Txs) {
      const vistaTotalPaise = Math.round(Number(t.addSeatData?.curTotal || t.addSeatData?.curTicketsTotal || 0) * 100);
      const fnbPaise = Math.round(Number(t.finalBookingCalculation?.foodCart?.fnbTotal || 0) * 100);
      const expectedTotalInVista = vistaTotalPaise + fnbPaise;

      const { multipayment } = buildMultiPaymentDetails({
        finalBooking: t.finalBookingCalculation,
        addSeatData: t.addSeatData,
        foodAndBvgResponse: t.foodAndBvgResponse
      });
      const amounts = [...multipayment.matchAll(/AMOUNT\d+=(\d+)/g)].map(m => Number(m[1]));
      const totalMultipaymentPaise = amounts.reduce((a, b) => a + b, 0);

      if (totalMultipaymentPaise !== expectedTotalInVista) {
        s1Mismatch++;
      } else {
        s1Match++;
      }
    }

    console.log(`\n=== SUMMARY FOR STATUS 1 (SUCCESS) ===`);
    console.log(`Total Status 1: ${s1Txs.length}`);
    console.log(`Total with AMOUNT MISMATCH: ${s1Mismatch}`);
    console.log(`Total matching: ${s1Match}`);

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

run();
