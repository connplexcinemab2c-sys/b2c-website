const mongoose = require('mongoose');
const uri = 'mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin';

mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 }).then(async () => {
  const db = mongoose.connection.db;

  const count = await db.collection('transactions').countDocuments({
    $or: [
      { paymentsStatus: true },
      { commitStatus: true },
      { 'paymentResponse.captured': true }
    ]
  });
  console.log(`Total completed transactions: ${count}`);

  const cursor = db.collection('transactions').find(
    {
      $or: [
        { paymentsStatus: true },
        { commitStatus: true },
        { 'paymentResponse.captured': true }
      ]
    },
    {
      projection: {
        _id: 1,
        initTransId: 1,
        createdAt: 1,
        movieId: 1,
        cinemaId: 1,
        'setSeatData.strSeatInfo': 1,
        'paymentResponse.contact': 1,
        'paymentResponse.amount': 1,
        'paymentResponse.status': 1,
        normalized_phone: 1,
        userId: 1,
        finalAmount: 1,
        'addSeatData.grossTicketsTotal': 1,
        'addSeatData.curTicketsTotal': 1,
        'commitBookingData.grossTicketsTotal': 1,
        'commitBookingData.vistaRawTicketsTotal': 1,
        'finalBookingCalculation.ticketCart': 1,
        'finalBookingCalculation.totalDiscount': 1,
        coupan: 1
      }
    }
  );

  const affected = [];

  while (await cursor.hasNext()) {
    const tx = await cursor.next();

    const gross = Number(tx.addSeatData?.grossTicketsTotal) ||
                  Number(tx.commitBookingData?.grossTicketsTotal) ||
                  Number(tx.commitBookingData?.vistaRawTicketsTotal) ||
                  0;
    
    const ticketCart = tx.finalBookingCalculation?.ticketCart;
    const cartTicketTotal = Number(ticketCart?.ticketTotal) || 0;
    const membershipDiscount = Number(ticketCart?.membershipDiscount) || 0;
    const discountAmount = Number(ticketCart?.discountAmount) || 0;
    const totalAfterDiscount = Number(ticketCart?.totalAfterDiscount) || 0;
    const finalAmount = Number(tx.finalAmount) || Number(tx.paymentResponse?.amount) || 0;

    // Check if compounding bug occurred:
    // When gross > 0 and cartTicketTotal was eroded significantly below gross (more than 5 rupees difference)
    const isEroded = gross > 0 && cartTicketTotal > 0 && (gross - cartTicketTotal > 5);

    // Or if odd decimal compounding fractions occurred (.64, .06, .69, .17, etc.) on ticketTotal
    const hasCompoundingDecimals = cartTicketTotal > 0 && ((cartTicketTotal * 100) % 50 !== 0) && (membershipDiscount > 0);

    if (isEroded || hasCompoundingDecimals) {
      affected.push({
        id: tx._id,
        initTransId: tx.initTransId,
        date: tx.createdAt,
        seats: tx.setSeatData?.strSeatInfo,
        contact: tx.paymentResponse?.contact || tx.normalized_phone,
        grossTicketsTotal: gross,
        cartTicketTotal,
        membershipDiscount,
        discountAmount,
        totalAfterDiscount,
        finalAmount,
        reason: isEroded ? `Gross was ₹${gross} but cart started at ₹${cartTicketTotal}` : `Compounded decimals detected (${cartTicketTotal})`
      });
    }
  }

  console.log(`\nAudit Complete! Found ${affected.length} affected transaction(s):\n`);
  for (const a of affected) {
    console.log(JSON.stringify(a, null, 2));
  }

  process.exit(0);
}).catch(err => {
  console.error('Audit error:', err);
  process.exit(1);
});
