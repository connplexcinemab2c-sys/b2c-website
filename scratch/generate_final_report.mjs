import mongoose from 'mongoose';
import { buildMultiPaymentDetails } from '../Backend/src/services/vistaServices/VistaPaymentHelper.js';

async function run() {
  try {
    await mongoose.connect('mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin');
    const db = mongoose.connection.db;

    const cinemas = await db.collection('cinemas').find({}).toArray();
    const cinemaMap = {};
    for (const c of cinemas) cinemaMap[c._id.toString()] = c.cinemaName;

    const days = [1, 2, 3, 4];
    const report = {};

    for (const d of days) {
      const start = new Date(`2026-10-0${d}T00:00:00.000+05:30`);
      const end = new Date(`2026-10-0${d}T23:59:59.999+05:30`);

      const txs = await db.collection('transactions').find({
        deletedStatus: 0,
        createdAt: { $gte: start, $lte: end },
        status: { $in: [1, 4, 5, 6] }
      }).toArray();

      const dateStr = `0${d}/10/2026`;
      report[dateStr] = {
        total: txs.length,
        success: txs.filter(t => t.status === 1).length,
        failed: txs.filter(t => t.status !== 1).length,
        status4_paymentDoneVistaFailed: txs.filter(t => t.status === 4).length,
        status5_paymentFailedAtGateway: txs.filter(t => t.status === 5).length,
        status4_amountMismatches: 0,
        topCinemasStatus4: {},
        topCinemasStatus5: {}
      };

      for (const t of txs) {
        const cName = cinemaMap[t.cinemaId?.toString()] || 'Unknown Cinema';
        if (t.status === 4) {
          report[dateStr].topCinemasStatus4[cName] = (report[dateStr].topCinemasStatus4[cName] || 0) + 1;
          const vistaTotalPaise = Math.round(Number(t.addSeatData?.curTotal || t.addSeatData?.curTicketsTotal || 0) * 100);
          const fnbPaise = Math.round(Number(t.finalBookingCalculation?.foodCart?.fnbTotal || 0) * 100);
          const { multipayment } = buildMultiPaymentDetails({
            finalBooking: t.finalBookingCalculation,
            addSeatData: t.addSeatData,
            foodAndBvgResponse: t.foodAndBvgResponse
          });
          const amounts = [...multipayment.matchAll(/AMOUNT\d+=(\d+)/g)].map(m => Number(m[1]));
          const totalMultipaymentPaise = amounts.reduce((a, b) => a + b, 0);
          if (totalMultipaymentPaise !== vistaTotalPaise + fnbPaise) {
            report[dateStr].status4_amountMismatches++;
          }
        } else if (t.status === 5) {
          report[dateStr].topCinemasStatus5[cName] = (report[dateStr].topCinemasStatus5[cName] || 0) + 1;
        }
      }
    }

    console.log("=== DAILY DEEP DIVE REPORT ===");
    console.log(JSON.stringify(report, null, 2));

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

run();
