import mongoose from 'mongoose';

async function run() {
  try {
    await mongoose.connect('mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin');
    const db = mongoose.connection.db;
    const khagaulTxs = await db.collection('transactions').find({
      cinemaId: new mongoose.Types.ObjectId('6a71e9a58098f2840f696464'),
      status: 4,
      createdAt: { $gte: new Date('2026-10-01T00:00:00.000Z') }
    }).toArray();

    console.log('Khagaul failed count:', khagaulTxs.length);
    for (const t of khagaulTxs) {
      console.log({
        initTransId: t.initTransId,
        addSeat_curTotal: t.addSeatData?.curTotal,
        addSeat_curTicketsTotal: t.addSeatData?.curTicketsTotal,
        ticketCart_ticketTotal: t.finalBookingCalculation?.ticketCart?.ticketTotal,
        diff: (t.addSeatData?.curTicketsTotal || 0) - (t.finalBookingCalculation?.ticketCart?.ticketTotal || 0)
      });
    }
    await mongoose.disconnect();
  } catch (e) {
    console.error(e);
  }
}

run();
