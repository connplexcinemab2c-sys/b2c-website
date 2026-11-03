import mongoose from 'mongoose';

async function run() {
  await mongoose.connect('mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin');
  const db = mongoose.connection.db;

  const txs = await db.collection('transactions').find({
    "addSeatData.curFoodTotal": { $gt: 0 },
    foodAndBvgResponse: { $ne: null }
  }).limit(5).toArray();

  console.log(`Found ${txs.length} transactions with both addSeatData.curFoodTotal and foodAndBvgResponse`);
  for (const t of txs) {
    console.log(`ID: ${t.initTransId}`);
    console.log('addSeatData:', {
      curTicketsTotal: t.addSeatData?.curTicketsTotal,
      curFoodTotal: t.addSeatData?.curFoodTotal,
      curTotal: t.addSeatData?.curTotal,
    });
    console.log('foodAndBvgResponse:', {
      curTicketsTotal: t.foodAndBvgResponse?.curTicketsTotal,
      curFoodTotal: t.foodAndBvgResponse?.curFoodTotal,
      curTotal: t.foodAndBvgResponse?.curTotal,
    });
    console.log('commitBookingData:', {
      curTicketsTotal: t.commitBookingData?.curTicketsTotal,
      curFoodTotal: t.commitBookingData?.curFoodTotal,
      curTotal: t.commitBookingData?.curTotal,
    });
  }

  await mongoose.disconnect();
}

run();
