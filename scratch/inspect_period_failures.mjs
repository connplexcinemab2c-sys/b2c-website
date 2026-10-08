import mongoose from 'mongoose';

async function run() {
  await mongoose.connect('mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin');
  const db = mongoose.connection.db;

  const ids = ['20000220165', '20000216511'];
  for (const id of ids) {
    const tx = await db.collection('transactions').findOne({
      $or: [{ transId: id }, { initTransId: id }]
    });
    console.log(`========================================`);
    console.log(`Transaction ID: ${id}`);
    const timeIST = new Date(tx.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    console.log(`Created Time (IST): ${timeIST}`);
    console.log(`Status: ${tx.status}, paymentsStatus: ${tx.paymentsStatus}, commitStatus: ${tx.commitStatus}`);
    console.log(`PaymentResponse:`, tx.paymentResponse);
    console.log(`FinalAmount:`, tx.finalBookingCalculation?.finalAmount);
    console.log(`TicketCart:`, tx.finalBookingCalculation?.ticketCart);
    console.log(`FoodCart:`, tx.finalBookingCalculation?.foodCart);
    console.log(`AddSeatData:`, {
      curTotal: tx.addSeatData?.curTotal,
      curTicketsTotal: tx.addSeatData?.curTicketsTotal,
      curFoodTotal: tx.addSeatData?.curFoodTotal,
      strException: tx.addSeatData?.strException,
      intException: tx.addSeatData?.intException,
    });
    console.log(`VistaErrorResponse:`, tx.vistaErrorResponse);
    console.log(`Logs:`, tx.logs);
  }

  await mongoose.disconnect();
}

run();
