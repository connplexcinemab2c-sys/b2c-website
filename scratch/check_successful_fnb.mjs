import mongoose from 'mongoose';

async function run() {
  await mongoose.connect('mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin');
  const db = mongoose.connection.db;

  // 1. Find successful transactions that had foodAndBvgResponse with curFoodTotal > 0
  const fnbSuccess = await db.collection('transactions').find({
    status: 1,
    $or: [
      { "foodAndBvgResponse.curFoodTotal": { $gt: 0 } },
      { "addSeatData.curFoodTotal": { $gt: 0 } },
      { "commitBookingData.curFoodTotal": { $gt: 0 } }
    ]
  }).sort({ createdAt: -1 }).limit(10).toArray();

  console.log(`Found ${fnbSuccess.length} successful transactions with food/concession:`);
  for (const t of fnbSuccess) {
    console.log({
      initTransId: t.initTransId,
      createdAt: t.createdAt,
      addSeat_curTotal: t.addSeatData?.curTotal,
      addSeat_curTicketsTotal: t.addSeatData?.curTicketsTotal,
      addSeat_curFoodTotal: t.addSeatData?.curFoodTotal,
      fnb_curFoodTotal: t.foodAndBvgResponse?.curFoodTotal,
      commit_curTotal: t.commitBookingData?.curTotal,
      commit_curTicketsTotal: t.commitBookingData?.curTicketsTotal,
      commit_curFoodTotal: t.commitBookingData?.curFoodTotal,
      logs: t.logs?.filter(l => l.vistaBookingRequest || l.paymentResponse)
    });

    // Check universallogs for this tx to see exact Vista request
    const ulog = await db.collection('universallogs').findOne({ transaction_id: t.initTransId });
    if (ulog) {
      console.log('Universallog steps:');
      for (const s of ulog.steps) {
        if (s.logType === 'paymentResponse' || s.logType === 'vistaBookingResponse') {
          console.log(`  ${s.logType}:`, s.message, s.response);
        }
      }
    }
  }

  await mongoose.disconnect();
}

run();
