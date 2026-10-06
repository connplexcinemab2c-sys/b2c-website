import mongoose from 'mongoose';
import { buildMultiPaymentDetails } from '../Backend/src/services/vistaServices/VistaPaymentHelper.js';

async function run() {
  try {
    await mongoose.connect('mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin');
    const db = mongoose.connection.db;

    const start = new Date('2026-10-01T00:00:00.000+05:30');
    const end = new Date('2026-10-04T23:59:59.999+05:30');

    const cinemas = await db.collection('cinemas').find({}).toArray();
    const cinemaMap = {};
    for (const c of cinemas) cinemaMap[c._id.toString()] = c.name || c.cinemaName;

    const status4Txs = await db.collection('transactions').find({
      deletedStatus: 0,
      createdAt: { $gte: start, $lte: end },
      status: 4
    }).toArray();

    console.log(`=== Total Status 4 Transactions: ${status4Txs.length} ===\n`);

    // Analyze characteristics of Status 4 transactions
    let withDiscounts = 0;
    let withoutDiscounts = 0;
    let withFnb = 0;
    let withoutFnb = 0;
    const timeToPayList = []; // seconds from createdAt to paymentSuccess
    const cinemaCount = {};

    for (const t of status4Txs) {
      const cName = cinemaMap[t.cinemaId?.toString()] || 'Unknown';
      cinemaCount[cName] = (cinemaCount[cName] || 0) + 1;

      const discount = t.finalBookingCalculation?.ticketCart?.discountAmount || 0;
      if (discount > 0) withDiscounts++;
      else withoutDiscounts++;

      const fnb = t.finalBookingCalculation?.foodCart?.fnbTotal || 0;
      if (fnb > 0) withFnb++;
      else withoutFnb++;

      // Check time difference between initBooking and paymentSuccess
      let initTime = t.createdAt;
      let paySuccessTime = null;
      if (t.logs && Array.isArray(t.logs)) {
        for (const l of t.logs) {
          if (l.paymentSuccess) paySuccessTime = new Date(l.paymentSuccess);
        }
      }
      if (paySuccessTime) {
        const diffSec = Math.round((paySuccessTime - initTime) / 1000);
        timeToPayList.push(diffSec);
      }
    }

    console.log("Cinema distribution of Status 4:");
    console.table(cinemaCount);

    console.log(`With discounts: ${withDiscounts}, Without discounts: ${withoutDiscounts}`);
    console.log(`With F&B: ${withFnb}, Without F&B: ${withoutFnb}`);

    if (timeToPayList.length > 0) {
      const avgSec = Math.round(timeToPayList.reduce((a, b) => a + b, 0) / timeToPayList.length);
      const minSec = Math.min(...timeToPayList);
      const maxSec = Math.max(...timeToPayList);
      console.log(`Time from Booking Init to Payment Success: Min=${minSec}s, Max=${maxSec}s, Avg=${avgSec}s`);
      console.log(`Transactions taking > 600s (10 min): ${timeToPayList.filter(s => s > 600).length}`);
      console.log(`Transactions taking > 300s (5 min): ${timeToPayList.filter(s => s > 300).length}`);
      console.log(`Transactions taking <= 300s (<=5 min): ${timeToPayList.filter(s => s <= 300).length}`);
    }

    // Now let's compare with Status 1 (Successful) in the same period
    const status1Txs = await db.collection('transactions').find({
      deletedStatus: 0,
      createdAt: { $gte: start, $lte: end },
      status: 1
    }).toArray();

    console.log(`\n=== Total Status 1 (Success) Transactions: ${status1Txs.length} ===`);
    const status1CinemaCount = {};
    let status1WithDiscounts = 0;
    let status1WithoutDiscounts = 0;
    for (const t of status1Txs) {
      const cName = cinemaMap[t.cinemaId?.toString()] || 'Unknown';
      status1CinemaCount[cName] = (status1CinemaCount[cName] || 0) + 1;
      const discount = t.finalBookingCalculation?.ticketCart?.discountAmount || 0;
      if (discount > 0) status1WithDiscounts++;
      else status1WithoutDiscounts++;
    }

    console.log(`Status 1 With discounts: ${status1WithDiscounts}, Without discounts: ${status1WithoutDiscounts}`);

    // Cinema success vs failure comparison
    const comparison = {};
    for (const c of Object.keys({ ...cinemaCount, ...status1CinemaCount })) {
      const s1 = status1CinemaCount[c] || 0;
      const s4 = cinemaCount[c] || 0;
      const total = s1 + s4;
      comparison[c] = {
        Successful: s1,
        Failed_Status4: s4,
        Status4_Rate: `${((s4 / total) * 100).toFixed(1)}%`
      };
    }
    console.log('\n=== Status 1 vs Status 4 by Cinema ===');
    console.table(comparison);

    // Let's print 5 examples with full details including multipayment calculation
    console.log('\n=== Sample 5 Status 4 with Multipayment Details ===');
    for (let i = 0; i < Math.min(5, status4Txs.length); i++) {
      const t = status4Txs[i];
      const multi = buildMultiPaymentDetails({
        finalBooking: t.finalBookingCalculation,
        addSeatData: t.addSeatData,
        foodAndBvgResponse: t.foodAndBvgResponse
      });
      console.log({
        initTransId: t.initTransId,
        cinema: cinemaMap[t.cinemaId?.toString()],
        multipayment: multi.multipayment,
        grossTicket: multi.grossTicket,
        paidTicket: multi.paidTicket,
        discountAmount: multi.discountAmount,
        fnbTotal: multi.fnbTotal,
        paymentResponseAmount: t.paymentResponse?.amount,
        finalBookingFinalAmount: t.finalBookingCalculation?.finalAmount,
        vistaError: t.vistaErrorResponse?.data?.substring(0, 150)
      });
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

run();
