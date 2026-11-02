import mongoose from 'mongoose';

async function run() {
  await mongoose.connect('mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin');
  const db = mongoose.connection.db;

  const start = new Date('2026-10-25T00:00:00.000+05:30');
  const now = new Date('2026-10-31T23:59:59.999+05:30');

  // Let's find all transactions where paymentsStatus: true OR paymentResponse exists
  const paidTxs = await db.collection('transactions').find({
    deletedStatus: 0,
    createdAt: { $gte: start, $lte: now },
    $or: [
      { paymentsStatus: true },
      { paymentResponse: { $ne: null } },
      { razorpayPaymentId: { $exists: true, $ne: "" } }
    ]
  }).sort({ createdAt: 1 }).toArray();

  console.log(`Total paid transactions this week (Oct 25 - 31): ${paidTxs.length}`);

  // Let's group them by status and commitStatus
  const groups = {};
  for (const t of paidTxs) {
    const key = `status:${t.status}|paymentsStatus:${t.paymentsStatus}|commitStatus:${t.commitStatus}`;
    groups[key] = (groups[key] || 0) + 1;
  }
  console.log('Breakdown:', groups);

  // Are there any duplicate bookings (same user, same show, same seats)?
  const seatShowMap = {};
  for (const t of paidTxs) {
    if (t.commitStatus && t.setSeatData?.strSeatInfo) {
      const k = `${t.cinemaId}_${t.sessionId}_${t.setSeatData.strSeatInfo}`;
      if (!seatShowMap[k]) seatShowMap[k] = [];
      seatShowMap[k].push(t);
    }
  }

  const dupes = Object.entries(seatShowMap).filter(([k, list]) => list.length > 1);
  console.log(`Duplicate confirmed bookings on same seats: ${dupes.length}`);
  for (const [k, list] of dupes) {
    console.log(`Seat collision key ${k}:`, list.map(x => ({ id: x.initTransId, amount: x.finalAmount, phone: x.normalized_phone })));
  }

  // Are there multiple transactions from the same user within 15 minutes?
  const userTxMap = {};
  for (const t of paidTxs) {
    const phone = t.normalized_phone || t.paymentResponse?.contact;
    if (phone) {
      if (!userTxMap[phone]) userTxMap[phone] = [];
      userTxMap[phone].push(t);
    }
  }

  console.log('\nUsers with multiple paid attempts:');
  for (const [phone, list] of Object.entries(userTxMap)) {
    if (list.length > 1) {
      console.log(`Phone: ${phone} (${list.length} transactions):`);
      for (const t of list) {
        console.log(`  Trans: ${t.initTransId || t.transId} | Status: ${t.status} | Commit: ${t.commitStatus} | Amount: ₹${t.finalAmount} | Date: ${new Date(t.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} | Seats: ${t.setSeatData?.strSeatInfo}`);
      }
    }
  }

  await mongoose.disconnect();
}

run();
