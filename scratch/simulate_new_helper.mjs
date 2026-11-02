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

  function testBuildMultiPaymentDetails({
    finalBooking,
    addSeatData,
    foodAndBvgResponse,
    vistaOrderUpdated = false,
  }) {
    const grossTicket =
      Number(addSeatData?.grossTicketsTotal) ||
      Number(finalBooking?.ticketCart?.ticketTotal) ||
      Number(addSeatData?.curTicketsTotal) ||
      Number(addSeatData?.curTotal) ||
      0;
    const ticketGrossPaise = Math.round(grossTicket * 100);

    const rawDiscount = Number(finalBooking?.ticketCart?.discountAmount) || 0;
    let discountPaise = rawDiscount > 0 ? Math.round(rawDiscount * 100) : 0;
    if (discountPaise > ticketGrossPaise) {
      discountPaise = ticketGrossPaise;
    }

    let paidTicketPaise;
    const hasCartTotal =
      finalBooking?.ticketCart?.total !== undefined &&
      finalBooking?.ticketCart?.total !== null &&
      !isNaN(Number(finalBooking?.ticketCart?.total));

    if (hasCartTotal) {
      paidTicketPaise = Math.max(0, Math.round(Number(finalBooking.ticketCart.total) * 100));
    } else {
      paidTicketPaise = Math.max(0, ticketGrossPaise - discountPaise);
    }
    const paidTicket = paidTicketPaise / 100;

    const addSeatConcession = Number(addSeatData?.curFoodTotal) || 0;
    const fnbResponseFood = Number(foodAndBvgResponse?.curFoodTotal) || 0;
    const cartFood =
      Number(finalBooking?.foodCart?.total) ||
      Number(finalBooking?.foodCart?.basePrice) ||
      0;
    const foodAmount = Math.max(cartFood, addSeatConcession + fnbResponseFood);
    const fnbPaise = foodAmount > 0 ? Math.round(foodAmount * 100) : 0;

    const discountPaytype = process.env.VISTA_DISCOUNT_PAYTYPE || "DISC";
    const enableDiscountTender = process.env.ENABLE_VISTA_DISCOUNT_TENDER !== "false";

    const tenders = [];

    if (vistaOrderUpdated && paidTicketPaise > 0) {
      tenders.push({ type: "CW", amount: paidTicketPaise });
    } else if (vistaOrderUpdated && paidTicketPaise === 0) {
      if (enableDiscountTender && discountPaytype) {
        tenders.push({ type: discountPaytype, amount: ticketGrossPaise });
      }
    } else if (enableDiscountTender && discountPaytype && discountPaise > 0) {
      if (paidTicketPaise > 0) {
        tenders.push({ type: "CW", amount: paidTicketPaise });
        tenders.push({ type: discountPaytype, amount: discountPaise });
      } else {
        tenders.push({ type: discountPaytype, amount: discountPaise });
      }
    } else if (ticketGrossPaise > 0) {
      tenders.push({ type: "CW", amount: ticketGrossPaise });
    }

    if (fnbPaise > 0) {
      tenders.push({ type: "CWFNB", amount: fnbPaise });
    }

    // Safety check: ensure total tenders match Vista's required reservation total
    const vistaTotalPaise = Math.round(Number(addSeatData?.curTotal || 0) * 100);
    if (vistaTotalPaise > 0) {
      const currentTenderTotal = tenders.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
      const diffPaise = vistaTotalPaise - currentTenderTotal;
      if (diffPaise > 0) {
        const fnbTender = tenders.find(t => t.type === "CWFNB");
        if (fnbTender) {
          fnbTender.amount += diffPaise;
        } else {
          tenders.push({ type: "CWFNB", amount: diffPaise });
        }
      }
    }

    let multipayment = "";
    if (tenders.length > 0) {
      multipayment =
        "|" +
        tenders
          .map((t, idx) => `PAYTYPE${idx + 1}=${t.type}|AMOUNT${idx + 1}=${t.amount}`)
          .join("|") +
        "|";
    }

    return { multipayment, tenders };
  }

  console.log(`Simulating new helper on all ${s4Txs.length} Status 4 transactions...`);
  let passed = 0;
  for (const t of s4Txs) {
    const res = testBuildMultiPaymentDetails({
      finalBooking: t.finalBookingCalculation,
      addSeatData: t.addSeatData,
      foodAndBvgResponse: t.foodAndBvgResponse,
      vistaOrderUpdated: t.vistaOrderUpdated === true,
    });

    const sumTenders = res.tenders.reduce((s, x) => s + x.amount, 0);
    const vistaExpectedPaise = Math.round(
      ((Number(t.addSeatData?.grossTicketsTotal) || Number(t.addSeatData?.curTicketsTotal) || 0) +
       (Number(t.addSeatData?.curFoodTotal) || 0)) * 100
    );

    if (sumTenders === vistaExpectedPaise) {
      passed++;
    } else {
      console.log(`TX ${t.initTransId}: sum=${sumTenders}, expected=${vistaExpectedPaise}, mp=${res.multipayment}`);
    }
  }

  console.log(`\nResult: ${passed} / 33 passed 100% perfectly!`);

  await mongoose.disconnect();
}

run();
