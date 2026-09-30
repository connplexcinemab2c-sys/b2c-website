import mongoose from 'mongoose';

async function run() {
  try {
    await mongoose.connect('mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin');
    const db = mongoose.connection.db;

    const c = await db.collection('cinemas').find({
      $or: [{ cinemaId: 'CN39' }, { cinemaName: /tribeca/i }, { name: /tribeca/i }]
    }).toArray();
    console.log("Cinemas:", c);

    // Also let's find any transactions where cinemaId = c[0]._id or cinemaId = 'CN39'
    const cIds = c.map(x => x._id);
    const txCount = await db.collection('transactions').countDocuments({ cinemaId: { $in: cIds } });
    console.log("Transactions with cinemaId in cIds:", txCount);

    // Let's search transactions where initTransId or anything has CN39 or cinemaName Tribeca
    const sampleTx = await db.collection('transactions').find({
      $or: [
        { cinemaId: { $in: cIds } },
        { "cinemaData.cinemaName": /tribeca/i },
        { "paymentResponse.notes.cinemaId": "CN39" }
      ]
    }).sort({ createdAt: -1 }).limit(10).toArray();

    console.log(`Found ${sampleTx.length} transactions:`);
    for (const t of sampleTx) {
      console.log(t._id, t.createdAt, t.cinemaId, t.movieData?.name, t.status, t.finalBookingCalculation?.ticketCart?.ticketTotal);
    }

    // Now let's search ANY transaction for "Avengers" across ALL cinemas recently
    const avengersTx = await db.collection('transactions').find({
      $or: [
        { "movieData.name": /avenger/i },
        { "addSeatData.strSeatInfo": /avenger/i }
      ]
    }).sort({ createdAt: -1 }).limit(10).toArray();

    console.log(`\nFound ${avengersTx.length} Avengers transactions:`);
    for (const t of avengersTx) {
      const cinemaDoc = await db.collection('cinemas').findOne({ _id: t.cinemaId });
      console.log(t._id, t.createdAt, cinemaDoc?.cinemaName || t.cinemaData?.cinemaName, t.status, t.showData);
    }

    // Now let's search ANY transaction created on Sept 29, Sept 30, or Oct 1 that mentions 18:40 or 6:40 or 06:40
    const strMatch = await db.collection('transactions').find({
      createdAt: { $gte: new Date("2026-09-28T00:00:00.000Z") }
    }).toArray();

    console.log(`Total transactions created since Sept 28: ${strMatch.length}`);
    const sixForty = strMatch.filter(t => /18:40|6:40|06:40/i.test(JSON.stringify(t)));
    console.log(`Transactions matching 6:40: ${sixForty.length}`);
    for (const t of sixForty) {
      const cinemaDoc = await db.collection('cinemas').findOne({ _id: t.cinemaId });
      console.log(t._id, t.createdAt, cinemaDoc?.cinemaName, t.movieData?.name, t.status);
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

run();
