import mongoose from 'mongoose';

async function run() {
  await mongoose.connect('mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin');
  const db = mongoose.connection.db;

  const succeededWithDisc = await db.collection('transactions').find({
    status: 1,
    $or: [
      { settlementNotes: /DISC/i },
      { 'paymentResponse.notes.multipayment': /DISC/i },
      { discountCouponStatus: true, 'finalBookingCalculation.ticketCart.discountAmount': { $gt: 0 } }
    ]
  }).sort({ createdAt: -1 }).limit(10).toArray();

  console.log(`Found ${succeededWithDisc.length} successful transactions with discounts:`);
  for (const t of succeededWithDisc) {
    console.log({
      initTransId: t.initTransId,
      createdAt: t.createdAt,
      status: t.status,
      discount: t.finalBookingCalculation?.ticketCart?.discountAmount,
      commitData: t.commitBookingData ? 'Has commit data' : 'None',
      settlementMode: t.settlementMode,
      settlementNotes: t.settlementNotes
    });
  }

  // Also check all status 1 transactions today:
  const todayStart = new Date('2026-11-02T00:00:00.000Z');
  const allTodayStatus1 = await db.collection('transactions').find({
    status: 1,
    createdAt: { $gte: todayStart }
  }).toArray();
  console.log(`\nAll status 1 transactions today (${allTodayStatus1.length}):`);
  for (const t of allTodayStatus1) {
    const disc = t.finalBookingCalculation?.ticketCart?.discountAmount || 0;
    console.log(`Tx ${t.initTransId}: time=${t.createdAt?.toISOString()}, discount=${disc}, cinema=${t.cinemaId}`);
  }

  await mongoose.disconnect();
}

run().catch(console.error);
