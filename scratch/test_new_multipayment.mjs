import mongoose from 'mongoose';

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

    function newBuildMultiPaymentDetails({ finalBooking, addSeatData, foodAndBvgResponse }) {
      const vistaGross =
        Number(addSeatData?.curTicketsTotal) ||
        Number(addSeatData?.curTotal) ||
        0;

      const grossTicket =
        vistaGross > 0
          ? vistaGross
          : Number(finalBooking?.ticketCart?.ticketTotal) ||
            Number(finalBooking?.ticketCart?.total) ||
            0;
      const ticketGrossPaise = Math.round(grossTicket * 100);

      const rawDiscount = Number(finalBooking?.ticketCart?.discountAmount) || 0;
      let discountPaise = rawDiscount > 0 ? Math.round(rawDiscount * 100) : 0;
      if (discountPaise > ticketGrossPaise) {
        discountPaise = ticketGrossPaise;
      }
      const paidTicketPaise = Math.max(0, ticketGrossPaise - discountPaise);
      const paidTicket = paidTicketPaise / 100;

      const foodAmount =
        Number(foodAndBvgResponse?.curFoodTotal) ||
        Number(finalBooking?.foodCart?.basePrice) ||
        Number(finalBooking?.foodCart?.total) ||
        0;
      const fnbPaise = foodAmount > 0 ? Math.round(foodAmount * 100) : 0;

      const discountPaytype = process.env.VISTA_DISCOUNT_PAYTYPE;
      const enableDiscountTender = process.env.ENABLE_VISTA_DISCOUNT_TENDER === "true";

      let payIndex = 1;
      let multipayment = "";

      if (enableDiscountTender && discountPaytype && discountPaise > 0) {
        if (paidTicketPaise > 0) {
          multipayment += `|PAYTYPE${payIndex}=CW|AMOUNT${payIndex}=${paidTicketPaise}|`;
          payIndex++;
          multipayment += `PAYTYPE${payIndex}=${discountPaytype}|AMOUNT${payIndex}=${discountPaise}|`;
          payIndex++;
        } else {
          multipayment += `|PAYTYPE${payIndex}=${discountPaytype}|AMOUNT${payIndex}=${discountPaise}|`;
          payIndex++;
        }
      } else {
        multipayment += `|PAYTYPE${payIndex}=CW|AMOUNT${payIndex}=${ticketGrossPaise}|`;
        payIndex++;
      }

      if (fnbPaise > 0) {
        multipayment += `PAYTYPE${payIndex}=CWFNB|AMOUNT${payIndex}=${fnbPaise}|`;
      }

      return { multipayment, grossTicket, paidTicket, discountPaise, fnbPaise, ticketGrossPaise };
    }

    let balancedCount = 0;
    for (const t of s4Txs) {
      const res = newBuildMultiPaymentDetails({
        finalBooking: t.finalBookingCalculation,
        addSeatData: t.addSeatData,
        foodAndBvgResponse: t.foodAndBvgResponse
      });

      const amounts = [...res.multipayment.matchAll(/AMOUNT\d+=(\d+)/g)].map(m => Number(m[1]));
      const totalSent = amounts.reduce((a, b) => a + b, 0);

      const vistaTotalPaise = Math.round(Number(t.addSeatData?.curTotal || t.addSeatData?.curTicketsTotal || 0) * 100);
      const fnbPaise = res.fnbPaise;
      const expectedTotal = vistaTotalPaise + fnbPaise;

      if (totalSent === expectedTotal) {
        balancedCount++;
      } else {
        console.log(`Still unbalanced for TX ${t.initTransId}: Sent ${totalSent} vs Expected ${expectedTotal}`);
      }
    }

    console.log(`\n=== SIMULATION RESULTS ===`);
    console.log(`Total Status 4 transactions tested: ${s4Txs.length}`);
    console.log(`Total transactions now 100% perfectly balanced with Vista: ${balancedCount} / ${s4Txs.length}`);

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

run();
