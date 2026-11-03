import mongoose from 'mongoose';

async function search() {
  try {
    await mongoose.connect('mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin');
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log('Searching for WWWZ9CS across all collections...');
    const target = 'WWWZ9CS';
    const regex = new RegExp('WWWZ9CS', 'i');

    for (const colInfo of collections) {
      const colName = colInfo.name;
      const count = await db.collection(colName).countDocuments();
      if (count === 0) continue;

      const query = {
        $or: [
          { booking_id: regex },
          { trans_id: regex },
          { order_id: regex },
          { pnr: regex },
          { bookingId: regex },
          { transactionId: regex },
          { vista_booking_id: regex },
          { booking_id_vista: regex },
          { reference_no: regex },
          { user_trans_id: regex },
          { orderId: regex },
          { payment_id: regex },
          { booking_trans_id: regex },
          { VistaBookingId: regex }
        ]
      };

      try {
        const found = await db.collection(colName).find(query).toArray();
        if (found.length > 0) {
          console.log(`\n=== Found in ${colName} (${found.length} records) ===`);
          for (const item of found) {
            console.log(JSON.stringify(item, null, 2));
          }
        }
      } catch (err) {
        // ignore
      }
    }

    // Also check transactions collection specifically with full regex on all string fields or full scan if needed
    console.log('\nChecking transactions collection specifically...');
    const txMatch = await db.collection('transactions').find({
      $or: [
        { booking_id: regex },
        { trans_id: regex },
        { order_id: regex },
        { pnr: regex },
        { bookingId: regex },
        { user_trans_id: regex },
        { payment_id: regex },
        { "vista_response": regex },
        { "vista_payload": regex },
        { "raw_response": regex }
      ]
    }).toArray();

    if (txMatch.length > 0) {
      console.log(`Matched in transactions: ${txMatch.length}`);
      for (const t of txMatch) {
        console.log(JSON.stringify(t, null, 2));
      }
    } else {
      console.log('No direct field matches in transactions with standard keys.');
    }

    // Also search in VistaLog
    console.log('\nChecking VistaLog collection...');
    const vistaMatches = await db.collection('vistalogs').find({
      $or: [
        { request: regex },
        { response: regex }
      ]
    }).limit(5).toArray();

    if (vistaMatches.length > 0) {
      console.log(`Matched in vistalogs: ${vistaMatches.length}`);
      for (const v of vistaMatches) {
        console.log(JSON.stringify(v, null, 2));
      }
    }

    // Also search logs / universallogs
    const logs = await db.collection('universallogs').find({
      log: regex
    }).limit(5).toArray();
    if (logs.length > 0) {
      console.log(`Matched in universallogs: ${logs.length}`);
    }

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

search();
