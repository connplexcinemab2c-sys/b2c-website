import mongoose from 'mongoose';

async function run() {
  await mongoose.connect('mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin');
  const db = mongoose.connection.db;

  const successfulTxs = await db.collection('transactions').find({
    status: 1,
    commitStatus: true,
    createdAt: { $gte: new Date('2026-11-01T00:00:00.000Z') }
  }).sort({ createdAt: -1 }).limit(15).toArray();

  console.log(`Found ${successfulTxs.length} successful transactions since Nov 01:\n`);

  for (const t of successfulTxs) {
    console.log(`ID: ${t.initTransId} | Date: ${t.createdAt}`);
    console.log(`   addSeatData: curTickets=${t.addSeatData?.curTicketsTotal}, curFood=${t.addSeatData?.curFoodTotal}, curTotal=${t.addSeatData?.curTotal}`);
    console.log(`   commitBookingData: curTickets=${t.commitBookingData?.curTicketsTotal}, curFood=${t.commitBookingData?.curFoodTotal}, curTotal=${t.commitBookingData?.curTotal}`);
    console.log(`   foodAndBvgResponse: ${JSON.stringify(t.foodAndBvgResponse)}`);
    console.log(`   finalBookingCalc: ticketTotal=${t.finalBookingCalculation?.ticketCart?.ticketTotal}, discount=${t.finalBookingCalculation?.ticketCart?.discountAmount}, fnbTotal=${t.finalBookingCalculation?.foodCart?.total}`);

    // Check logs for CommitBookingEx URL or multiPayment
    const uLog = await db.collection('universallogs').findOne({
      transaction_id: t.initTransId,
      "step.url": { $regex: /CommitBookingEx/ }
    });
    if (uLog) {
      console.log(`   Commit URL: ${uLog.step.url}`);
    }
    console.log('----------------------------------------------------');
  }

  await mongoose.disconnect();
}

run();
