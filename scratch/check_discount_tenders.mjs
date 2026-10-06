import mongoose from 'mongoose';

async function run() {
  try {
    await mongoose.connect('mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin');
    const db = mongoose.connection.db;

    const start = new Date('2026-10-01T00:00:00.000+05:30');
    const end = new Date('2026-10-04T23:59:59.999+05:30');

    const s1WithDiscounts = await db.collection('transactions').find({
      deletedStatus: 0,
      createdAt: { $gte: start, $lte: end },
      status: 1,
      'finalBookingCalculation.ticketCart.discountAmount': { $gt: 0 }
    }).limit(10).toArray();

    console.log(`Found ${s1WithDiscounts.length} Status 1 with discounts`);
    for (const t of s1WithDiscounts) {
      console.log({
        initTransId: t.initTransId,
        cinemaId: t.cinemaId,
        grossTicketTotal: t.finalBookingCalculation?.ticketCart?.ticketTotal,
        discount: t.finalBookingCalculation?.ticketCart?.discountAmount,
        curTicketsTotalInVista: t.commitBookingData?.curTicketsTotal,
        addSeat_curTotal: t.addSeatData?.curTotal,
        addSeat_curTicketsTotal: t.addSeatData?.curTicketsTotal
      });
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

run();
