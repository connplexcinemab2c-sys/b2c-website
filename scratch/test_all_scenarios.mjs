import mongoose from 'mongoose';

async function testCases() {
  const { buildMultiPaymentDetails } = await import('../Backend/src/services/vistaServices/VistaPaymentHelper.js');

  console.log("Testing edge cases...");

  // Case 1: 3D movie (no F&B)
  const c1 = buildMultiPaymentDetails({
    addSeatData: { curTotal: 880, curTicketsTotal: 820, curFoodTotal: 60 },
    foodAndBvgResponse: null,
    finalBooking: { ticketCart: { ticketTotal: 820, discountAmount: 0 } }
  });
  console.log("Case 1 (3D movie no F&B):", c1.multipayment, "Sum matches 88000?", c1.tenders.reduce((s,t)=>s+t.amount,0) === 88000);

  // Case 2: 3D movie with F&B
  const c2 = buildMultiPaymentDetails({
    addSeatData: { curTotal: 350, curTicketsTotal: 320, curFoodTotal: 30 },
    foodAndBvgResponse: { curTotal: 656, curTicketsTotal: 320, curFoodTotal: 336 },
    finalBooking: { ticketCart: { ticketTotal: 320 }, foodCart: { total: 336 } }
  });
  console.log("Case 2 (3D movie + F&B):", c2.multipayment, "Sum matches 65600?", c2.tenders.reduce((s,t)=>s+t.amount,0) === 65600);

  // Case 3: 2D movie with F&B
  const c3 = buildMultiPaymentDetails({
    addSeatData: { curTotal: 2800, curTicketsTotal: 2800, curFoodTotal: 0 },
    foodAndBvgResponse: { curTotal: 3276.19, curTicketsTotal: 2800, curFoodTotal: 476.19 },
    finalBooking: { ticketCart: { ticketTotal: 2800 }, foodCart: { total: 476.19 } }
  });
  console.log("Case 3 (2D movie + F&B):", c3.multipayment, "Sum matches 327619?", c3.tenders.reduce((s,t)=>s+t.amount,0) === 327619);

  // Case 4: 100% Free coupon ticket
  const c4 = buildMultiPaymentDetails({
    addSeatData: { curTotal: 0, curTicketsTotal: 0, curFoodTotal: 0 },
    foodAndBvgResponse: null,
    finalBooking: { ticketCart: { ticketTotal: 600, discountAmount: 600 } }
  });
  console.log("Case 4 (Free ticket):", c4.multipayment, "Sum matches 0?", c4.tenders.reduce((s,t)=>s+t.amount,0) === 0);
}

testCases();
