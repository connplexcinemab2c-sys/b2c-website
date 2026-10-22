/**
 * Helper to construct Vista MultiPaymentDetails string supporting discount tender splits.
 *
 * @param {Object} params
 * @param {Object} params.finalBooking - finalBookingCalculation from Transaction
 * @param {Object} params.addSeatData - addSeatData from Transaction
 * @param {Object} params.foodAndBvgResponse - foodAndBvgResponse from Transaction
 * @returns {{ multipayment: string, grossTicket: number, paidTicket: number, discountAmount: number, fnbTotal: number }}
 */
export const buildMultiPaymentDetails = ({
  finalBooking,
  addSeatData,
  foodAndBvgResponse,
  vistaOrderUpdated = false,
}) => {
  // 1. Gross ticket reservation amount held in Vista
  // Vista requires udsCommitBook tender amounts to sum exactly to the gross seat reservation.
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

  // Determine actual net paid ticket amount (Total price - Discount applied)
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

  const foodAmount =
    Number(foodAndBvgResponse?.curFoodTotal) ||
    Number(finalBooking?.foodCart?.basePrice) ||
    Number(finalBooking?.foodCart?.total) ||
    0;
  const fnbPaise = foodAmount > 0 ? Math.round(foodAmount * 100) : 0;

  const discountPaytype = process.env.VISTA_DISCOUNT_PAYTYPE;
  const enableDiscountTender = process.env.ENABLE_VISTA_DISCOUNT_TENDER === "true";

  const tenders = [];

  // CASE 1: Cinema configured with dedicated discount tender in Vista POS (e.g. DISC, VOUC)
  if (enableDiscountTender && discountPaytype && discountPaise > 0) {
    if (paidTicketPaise > 0) {
      tenders.push({ type: "CW", amount: paidTicketPaise });
      tenders.push({ type: discountPaytype, amount: discountPaise });
    } else {
      // 100% ticket discount: customer paid 0 for tickets
      tenders.push({ type: discountPaytype, amount: discountPaise });
    }
  }
  // CASE 2: Standard tender flow (CW only)
  // Reflect the net customer paid amount (Total Price - Discount Applied) in Vista DB (Trans_Cash)
  else {
    if (paidTicketPaise > 0) {
      tenders.push({ type: "CW", amount: paidTicketPaise });
    } else if (ticketGrossPaise > 0) {
      // 100% discount: customer paid 0 for tickets.
      // Vista's udsCommitBook rejects AMOUNT=0, so tender gross reservation or discount paytype.
      if (discountPaytype) {
        tenders.push({ type: discountPaytype, amount: ticketGrossPaise });
      } else {
        tenders.push({ type: "CW", amount: ticketGrossPaise });
      }
    }
  }

  // F&B tender under CWFNB
  if (fnbPaise > 0) {
    tenders.push({ type: "CWFNB", amount: fnbPaise });
  }

  // Build pipe-delimited MultiPaymentDetails string:
  // e.g. |PAYTYPE1=CW|AMOUNT1=10000| or |PAYTYPE1=CW|AMOUNT1=10000|PAYTYPE2=CWFNB|AMOUNT2=5000|
  let multipayment = "";
  if (tenders.length > 0) {
    multipayment =
      "|" +
      tenders
        .map((t, idx) => `PAYTYPE${idx + 1}=${t.type}|AMOUNT${idx + 1}=${t.amount}`)
        .join("|") +
      "|";
  }

  return {
    multipayment,
    grossTicket,
    paidTicket,
    discountAmount: discountPaise / 100,
    fnbTotal: fnbPaise / 100,
    ticketGrossPaise,
    paidTicketPaise,
    discountPaise,
    fnbPaise,
  };
};

/**
 * Format commitBookingData with accurate audit breakdown for discounts.
 *
 * @param {Object} vistaData - response.data.data from Vista CommitBookingEx
 * @param {Object} tx - Transaction document with finalBookingCalculation
 * @returns {Object} enriched commitData
 */
export const formatCommitBookingData = (vistaData, tx) => {
  let commitData = vistaData ? { ...vistaData } : {};
  const ticketCart = tx?.finalBookingCalculation?.ticketCart;

  const hasDiscount = ticketCart && Number(ticketCart.discountAmount) > 0;
  const hasTicketTotal =
    ticketCart &&
    ticketCart.total !== undefined &&
    ticketCart.total !== null;

  if (hasDiscount && hasTicketTotal) {
    const discountedTotal = String(ticketCart.total);
    const cgst = String(ticketCart.cgst);
    const sgst = String(ticketCart.sgst);
    const grossTotal = commitData.curTicketsTotal || String(ticketCart.ticketTotal || "");

    const foodTotal = Number(commitData.curFoodTotal) || 0;
    const bookingFee = Number(commitData.curBookingFee) || 0;
    const netCurTotal = Number(discountedTotal) + foodTotal + bookingFee;

    commitData = {
      ...commitData,
      vistaRawTicketsTotal: commitData.curTicketsTotal,
      grossTicketsTotal: grossTotal,
      discountAmount: ticketCart.discountAmount,
      discountPaytype: process.env.VISTA_DISCOUNT_PAYTYPE || "CW",
      curTicketsTotal: discountedTotal,
      curTicketsTax1: cgst,
      curTicketsTax2: sgst,
      curTotal: netCurTotal,
    };
  }

  return commitData;
};
