import mongoose from 'mongoose';

async function run() {
  try {
    await mongoose.connect('mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin');
    const db = mongoose.connection.db;

    console.log("Connected to MongoDB successfully.\n");

    // Let's test with both UTC dates and IST dates (since timestamps in mongo are UTC)
    for (const tz of ['IST', 'UTC']) {
      console.log(`=== Testing Timezone: ${tz} ===`);
      for (const day of [1, 2, 3, 4, 5]) {
        let start, end;
        if (tz === 'IST') {
          // IST is UTC+5:30 -> Oct X 00:00:00 IST is Oct (X-1) 18:30:00 UTC
          start = new Date(`2026-10-0${day}T00:00:00.000+05:30`);
          end = new Date(`2026-10-0${day}T23:59:59.999+05:30`);
        } else {
          start = new Date(`2026-10-0${day}T00:00:00.000Z`);
          end = new Date(`2026-10-0${day}T23:59:59.999Z`);
        }

        // Definition 1: Dashboard ticketSuccessCount / ticketFailedCount
        const success1 = await db.collection('transactions').countDocuments({
          deletedStatus: 0,
          paymentsStatus: true,
          commitStatus: true,
          'commitBookingData.strBookId': { $exists: true, $ne: '' },
          createdAt: { $gte: start, $lte: end }
        });
        const failed1 = await db.collection('transactions').countDocuments({
          deletedStatus: 0,
          paymentsStatus: true,
          $or: [{ commitStatus: false }, { commitStatus: { $exists: false } }],
          createdAt: { $gte: start, $lte: end }
        });

        // Definition 2: All transactions (including payment failed)
        // status 1 vs status != 1
        const status1Count = await db.collection('transactions').countDocuments({
          deletedStatus: 0,
          status: 1,
          createdAt: { $gte: start, $lte: end }
        });
        const statusNot1Count = await db.collection('transactions').countDocuments({
          deletedStatus: 0,
          status: { $ne: 1 },
          createdAt: { $gte: start, $lte: end }
        });

        // Definition 3: status 1 vs status in [4, 5, 6]
        const failedPaymentOrBooking = await db.collection('transactions').countDocuments({
          deletedStatus: 0,
          status: { $in: [4, 5, 6] },
          createdAt: { $gte: start, $lte: end }
        });

        // Definition 4: Total records in transactions
        const total = await db.collection('transactions').countDocuments({
          deletedStatus: 0,
          createdAt: { $gte: start, $lte: end }
        });

        console.log(`0${day}/10/2026:`);
        console.log(`  Def 1 (Paid: commitStatus true vs false): Success=${success1}, Failed=${failed1}, Total=${success1 + failed1}`);
        console.log(`  Def 2 (Status 1 vs !=1): Success=${status1Count}, Not1=${statusNot1Count}, Total=${total}`);
        console.log(`  Def 3 (Status 4/5/6): Failed=${failedPaymentOrBooking}`);
      }
      console.log('');
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

run();
