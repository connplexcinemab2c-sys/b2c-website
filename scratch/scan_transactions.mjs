import mongoose from 'mongoose';

async function run() {
  await mongoose.connect('mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin');
  const db = mongoose.connection.db;

  const count = await db.collection('transactions').countDocuments();
  console.log('Total transactions in DB:', count);

  // Let's do a cursor scan or targeted search for WWWZ9CS
  const target = 'WWWZ9CS';

  // Check with regex in addSeatData, commitBookingData, logs, etc.
  const found = await db.collection('transactions').find({
    $or: [
      { 'commitBookingData.strBookId': { $regex: target, $options: 'i' } },
      { 'addSeatData.strBookId': { $regex: target, $options: 'i' } },
      { 'setSeatData.strBookId': { $regex: target, $options: 'i' } },
      { 'commitBookingData.strBookIdEx': { $regex: target, $options: 'i' } },
      { 'addSeatData.strBookIdEx': { $regex: target, $options: 'i' } },
      { 'initTransId': target },
      { 'paymentResponse.id': target },
      { 'razorpayPaymentId': target }
    ]
  }).toArray();

  console.log('Matching transactions:', found.length);
  if (found.length > 0) {
    console.log(JSON.stringify(found[0], null, 2));
  }

  // Also check if any transaction string representation contains WWWZ9CS
  if (found.length === 0) {
    console.log('Scanning all transactions batch by batch for substring WWWZ9CS...');
    const cursor = db.collection('transactions').find({}).sort({ _id: -1 });
    let scanned = 0;
    let matchedDoc = null;
    while (await cursor.hasNext()) {
      const doc = await cursor.next();
      scanned++;
      const str = JSON.stringify(doc);
      if (str.toLowerCase().includes(target.toLowerCase())) {
        console.log(`Found match in transaction ${doc._id} after scanning ${scanned} docs!`);
        matchedDoc = doc;
        break;
      }
      if (scanned % 5000 === 0) {
        console.log(`Scanned ${scanned}/${count}...`);
      }
    }

    if (matchedDoc) {
      console.log('Found doc:', JSON.stringify(matchedDoc, null, 2));
    } else {
      console.log(`Scanned all ${scanned} transactions, not found in transactions.`);
    }
  }

  await mongoose.disconnect();
}

run();
