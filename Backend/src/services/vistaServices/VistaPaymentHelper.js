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

  const paidTicketPaise = Math.max(0, ticketGrossPaise - discountPaise);
  const paidTicket = paidTicketPaise / 100;

  const foodAmount =
    Number(foodAndBvgResponse?.curFoodTotal) ||
    Number(finalBooking?.foodCart?.basePrice) ||
    Number(finalBooking?.foodCart?.total) ||
    0;
  const fnbPaise = foodAmount > 0 ? Math.round(foodAmount * 100) : 0;

  let payIndex = 1;
  let multipayment = "";

  // Only pass the actual customer paid amount for tickets to Vista (Trans_Cash table).
  // The discount amount (e.g. 760/-) must NOT be passed as a tender entry in Trans_Cash.
  if (paidTicketPaise > 0) {
    multipayment += `|PAYTYPE${payIndex}=CW|AMOUNT${payIndex}=${paidTicketPaise}|`;
    payIndex++;
  } else if (ticketGrossPaise > 0 && discountPaise >= ticketGrossPaise) {
    // 100% discount: customer paid 0 for tickets
    multipayment += `|PAYTYPE${payIndex}=CW|AMOUNT${payIndex}=0|`;
    payIndex++;
  } else {
    multipayment += `|PAYTYPE${payIndex}=CW|AMOUNT${payIndex}=${ticketGrossPaise}|`;
    payIndex++;
  }

  if (fnbPaise > 0) {
    multipayment += `PAYTYPE${payIndex}=CWFNB|AMOUNT${payIndex}=${fnbPaise}|`;
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
