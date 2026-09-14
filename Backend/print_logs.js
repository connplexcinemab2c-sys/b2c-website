import mongoose from 'mongoose';

const MONGO_URL = "mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin";

async function main() {
  try {
    await mongoose.connect(MONGO_URL, { serverSelectionTimeoutMS: 5000 });
    const db = mongoose.connection.db;

    const logs = await db.collection("universallogs").find({
      "steps.logType": "updateVistaOrderPrice"
    }).sort({ _id: -1 }).limit(5).toArray();

    console.log("\n==================== RECENT VISTA DISCOUNT LOGS ====================");
    for (const log of logs) {
      const tx = await db.collection("transactions").findOne({ initTransId: log.transaction_id });
      const updateStep = log.steps.find(s => s.logType === "updateVistaOrderPrice");
      const commitStep = log.steps.find(s => s.logType === "vistaBookingResponse");

      const discountAmount = tx?.finalBookingCalculation?.ticketCart?.discountAmount || 0;
      const customerPaid = tx?.finalBookingCalculation?.ticketCart?.total || 'N/A';
      const committedAmount = commitStep?.response?.data?.curTicketsTotal;

      let commitReport = 'Not committed';
      if (committedAmount !== undefined) {
        if (discountAmount > 0 && tx?.commitBookingData?.discountAmount) {
          commitReport = `${committedAmount} (Gross: ₹${tx.commitBookingData.grossTicketsTotal || committedAmount}, Discount Tender: ₹${tx.commitBookingData.discountAmount} [${tx.commitBookingData.discountPaytype || 'DISC'}], Net: ₹${tx.commitBookingData.curTicketsTotal})`;
        } else if (Number(committedAmount) === Number(customerPaid)) {
          commitReport = `${committedAmount} (MATCHES DISCOUNTED TOTAL!)`;
        } else {
          commitReport = `${committedAmount} (FULL PRICE RECORDED IN VISTA!)`;
        }
      }

      console.log(`\n--- Transaction ID: ${log.transaction_id} ---`);
      console.log(`Time: ${updateStep?.timestamp || 'N/A'}`);
      console.log(`Original Ticket Total (Gross): ${tx?.finalBookingCalculation?.ticketCart?.ticketTotal || 'N/A'}`);
      console.log(`Discount Applied on Website: ${discountAmount}`);
      console.log(`Discounted Total (Customer Paid): ${customerPaid}`);
      console.log(`Settlement Mode: ${updateStep?.settlementMode || (updateStep?.success ? 'DIRECT_ORDER_UPDATE' : 'LEGACY_UNSETTLED')}`);
      console.log(`updateVistaOrderPrice Result: ${updateStep?.success ? 'SUCCESS' : 'FAILED - NOT APPLIED IN VISTA'}`);
      console.log(`Vista DB Committed Amount: ${commitReport}`);
    }
    console.log("\n====================================================================\n");

    await mongoose.disconnect();
  } catch (err) {
    console.error("DB Error:", err.message);
  }
}

main();
