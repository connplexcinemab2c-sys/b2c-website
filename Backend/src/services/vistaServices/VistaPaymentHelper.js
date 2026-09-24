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
  const grossTicket =
    Number(finalBooking?.ticketCart?.ticketTotal) ||
    Number(addSeatData?.curTicketsTotal) ||
    Number(finalBooking?.ticketCart?.total) ||
    0;
  const ticketGrossPaise = Math.round(grossTicket * 100);

  const hasPaidTicket =
    finalBooking?.ticketCart?.total !== undefined &&
    finalBooking?.ticketCart?.total !== null &&
    !isNaN(Number(finalBooking?.ticketCart?.total));

  const paidTicket = hasPaidTicket
    ? Math.max(0, Number(finalBooking.ticketCart.total))
    : grossTicket;
  let paidTicketPaise = Math.round(paidTicket * 100);

  let discountPaise = 0;
  const rawDiscount =
    Number(finalBooking?.ticketCart?.discountAmount) ||
    (grossTicket > paidTicket ? grossTicket - paidTicket : 0);

  if (rawDiscount > 0 && paidTicketPaise < ticketGrossPaise) {
    discountPaise = ticketGrossPaise - paidTicketPaise;
  }

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
      // 100% ticket discount: customer paid 0 for tickets
      multipayment += `|PAYTYPE${payIndex}=${discountPaytype}|AMOUNT${payIndex}=${discountPaise}|`;
      payIndex++;
    }
  } else {
    // Vista holds seats at gross ticket total (in paise).
    // udsCommitBook requires the gross ticket reservation amount under valid tender CW.
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
