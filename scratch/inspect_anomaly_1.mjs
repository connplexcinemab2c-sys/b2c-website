import mongoose from 'mongoose';

async function run() {
  await mongoose.connect('mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin');
  const db = mongoose.connection.db;

  const tx = await db.collection('transactions').findOne({ _id: new mongoose.Types.ObjectId('6aa698a5d0623e60c83e9e5b') });
  console.log("Transaction 6aa698a5d0623e60c83e9e5b:");
  console.log("status:", tx.status);
  console.log("paymentsStatus:", tx.paymentsStatus);
  console.log("commitStatus:", tx.commitStatus);
  console.log("logs:", tx.logs);
  console.log("commitBookingData:", tx.commitBookingData);
  console.log("paymentResponse:", tx.paymentResponse);

  await mongoose.disconnect();
}

run();
