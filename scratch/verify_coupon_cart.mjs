import { recalculateCartPrices } from '../Backend/src/services/CouponCartService.js';

function runSimulation() {
  const resolvedTicketTotal = 600; // e.g. 2 tickets @ 300
  const resolvedFnbPrice = 150;     // e.g. Popcorn

  const discountVal = 100; // 100%
  const discountTarget = 'Cinema';
  const couponUpTo = 100000;

  let totalDiscount = (resolvedTicketTotal * discountVal) / 100;
  if (couponUpTo && totalDiscount > couponUpTo) {
    totalDiscount = couponUpTo;
  }

  console.log('Ticket Price Before:', resolvedTicketTotal);
  console.log('F&B Price:', resolvedFnbPrice);
  console.log('Coupon Target:', discountTarget);
  console.log('Total Discount Calculated:', totalDiscount);

  let cart = {
    ticketCart: {
      ticketTotal: resolvedTicketTotal,
      membershipDiscount: 0,
      discountAmount: 0,
      couponDiscount: 0,
      totalAfterDiscount: 0,
      total: resolvedTicketTotal,
      coupons: [],
    },
    foodCart: {
      fnbTotal: resolvedFnbPrice,
      membershipDiscount: 0,
      discountAmount: 0,
      couponDiscount: 0,
      totalAfterDiscount: 0,
      total: resolvedFnbPrice,
      coupons: [],
    },
    rewardCoinsRedeemed: 0,
    rewardDiscountApplied: 0,
    rewardDiscount: 0,
    convenienceFeesObject: {
      convenienceFees: 30,
      gst: 5.4,
      total: 35.4,
    },
    totalDiscount: 0,
    finalAmount: 0,
  };

  recalculateCartPrices(cart, totalDiscount, discountTarget);

  console.log('--- Recalculated Cart Results ---');
  console.log('  Ticket Total After Discount:', cart.ticketCart.total);
  console.log('  Ticket Discount Amount:', cart.ticketCart.discountAmount);
  console.log('  Ticket Coupon Discount:', cart.ticketCart.couponDiscount);
  console.log('  Ticket Base Price (excl GST):', cart.ticketCart.basePrice);
  console.log('  Ticket CGST:', cart.ticketCart.cgst);
  console.log('  Ticket SGST:', cart.ticketCart.sgst);
  console.log('  Food Total Payable:', cart.foodCart.total);
  console.log('  Convenience Fees Payable:', cart.convenienceFeesObject.total);
  console.log('  Total Discount Given:', cart.totalDiscount);
  console.log('  Final Total Payable:', cart.finalAmount);
}

runSimulation();
