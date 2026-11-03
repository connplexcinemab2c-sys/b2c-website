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
  // 1. Determine Vista POS exact required reservation total (in paise)
  // Vista requires udsCommitBook tender amounts to sum exactly to the reservation total held in Vista.
  const reservationTotal = Number(
    foodAndBvgResponse?.curTotal ?? addSeatData?.curTotal ?? 0
  );
  const vistaTotalPaise = Math.max(0, Math.round(reservationTotal * 100));

  // 2. Determine Vista POS exact concession/F&B amount (in paise)
  // In 3D shows, Vista auto-attaches mandatory 3D glasses in addSeatData.curFoodTotal.
  // When food is added separately, Vista's foodAndBvgResponse includes both 3D glasses and food.
  const vistaFood = Number(
    foodAndBvgResponse?.curFoodTotal !== undefined && foodAndBvgResponse?.curFoodTotal !== null
      ? foodAndBvgResponse.curFoodTotal
      : (addSeatData?.curFoodTotal || 0)
  );
  let fnbPaise = Math.max(0, Math.round(vistaFood * 100));
  if (fnbPaise > vistaTotalPaise) {
    fnbPaise = vistaTotalPaise;
  }

  // 3. Ticket portion is the exact remainder so sum of tenders ALWAYS equals vistaTotalPaise
  const ticketPaise = Math.max(0, vistaTotalPaise - fnbPaise);

  // 4. Handle discount split if explicitly enabled in environment
  const discountPaytype = process.env.VISTA_DISCOUNT_PAYTYPE || "DISC";
  const enableDiscountTender = process.env.ENABLE_VISTA_DISCOUNT_TENDER === "true";
  const rawDiscount = Number(finalBooking?.ticketCart?.discountAmount) || 0;
  let discountPaise = rawDiscount > 0 ? Math.round(rawDiscount * 100) : 0;
  if (discountPaise > ticketPaise) {
    discountPaise = ticketPaise;
  }

  const tenders = [];

  // When discount tenders are active and discount was applied, split ticket between CW and discountPaytype
  if (enableDiscountTender && discountPaise > 0) {
    const paidTicketPaise = ticketPaise - discountPaise;
    if (paidTicketPaise > 0) {
      tenders.push({ type: "CW", amount: paidTicketPaise });
    }
    tenders.push({ type: discountPaytype, amount: discountPaise });
  } else if (ticketPaise > 0) {
    // Default / Standard: All ticket value tendered under CW
    tenders.push({ type: "CW", amount: ticketPaise });
  }

  // Add Concession / 3D glasses tender
  if (fnbPaise > 0) {
    tenders.push({ type: "CWFNB", amount: fnbPaise });
  }

  // Handle 100% free booking (0 total)
  if (tenders.length === 0 && vistaTotalPaise === 0) {
    tenders.push({ type: "CW", amount: 0 });
  }

  // Critical Mathematical Invariant:
  // Ensure sum(tenders) strictly equals vistaTotalPaise to prevent ANY Vista commit rejection
  const currentTenderTotal = tenders.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  const diffPaise = vistaTotalPaise - currentTenderTotal;
  if (diffPaise !== 0 && tenders.length > 0) {
    // Absorb any microscopic rounding drift into the primary CW tender
    const primaryTender = tenders.find((t) => t.type === "CW") || tenders[0];
    primaryTender.amount += diffPaise;
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
    grossTicket: ticketPaise / 100,
    paidTicket: (ticketPaise - discountPaise) / 100,
    discountAmount: discountPaise / 100,
    fnbTotal: fnbPaise / 100,
    ticketGrossPaise: ticketPaise,
    paidTicketPaise: ticketPaise - discountPaise,
    discountPaise,
    fnbPaise,
    totalPaise: vistaTotalPaise,
    tenders,
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
    const grossTotal =
      commitData.grossTicketsTotal ||
      tx?.addSeatData?.grossTicketsTotal ||
      commitData.curTicketsTotal ||
      String(ticketCart.ticketTotal || "");

    const foodTotal = Number(commitData.curFoodTotal) || 0;
    const bookingFee = Number(commitData.curBookingFee) || 0;
    const netCurTotal = Number(discountedTotal) + foodTotal + bookingFee;

    commitData = {
      ...commitData,
      vistaRawTicketsTotal: commitData.curTicketsTotal,
      grossTicketsTotal: grossTotal,
      discountAmount: ticketCart.discountAmount,
      discountPaytype:
        process.env.ENABLE_VISTA_DISCOUNT_TENDER === "true" && process.env.VISTA_DISCOUNT_PAYTYPE
          ? process.env.VISTA_DISCOUNT_PAYTYPE
          : "CW",
      curTicketsTotal: discountedTotal,
      curTicketsTax1: cgst,
      curTicketsTax2: sgst,
      curTotal: netCurTotal,
    };
  }

  return commitData;
};
