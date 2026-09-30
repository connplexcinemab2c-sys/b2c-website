import mongoose from 'mongoose';

async function run() {
  try {
    await mongoose.connect('mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin');
    const db = mongoose.connection.db;

    const ids = [
      new mongoose.Types.ObjectId('6ab5fa5a364a058e26d378a0'),
      new mongoose.Types.ObjectId('6ab683171b1734c6bcad4cc7'),
      new mongoose.Types.ObjectId('6ab8eecbfe2ca3e6f825232f')
    ];

    const docs = await db.collection('transactions').find({ _id: { $in: ids } }).toArray();

    for (const doc of docs) {
      console.log("\n================ FULL DOC ================");
      console.log(`ID: ${doc._id}`);
      console.log(`initTransId: ${doc.initTransId}`);
      console.log(`createdAt: ${doc.createdAt}`);
      console.log(`movieData:`, doc.movieData);
      console.log(`showData:`, doc.showData);
      console.log(`cinemaData:`, doc.cinemaData);
      console.log(`commitBookingData:`, doc.commitBookingData);
      console.log(`addSeatData:`, doc.addSeatData);
      console.log(`finalBookingCalculation:`, JSON.stringify(doc.finalBookingCalculation, null, 2));
      console.log(`paymentResponse:`, doc.paymentResponse);
      console.log(`paymentDetail:`, doc.paymentDetail);
      console.log(`paymentsBreakup:`, doc.paymentsBreakup);
    }

    // Check ALL Paradise bookings over the weekend (regardless of utm_source)
    const paradiseMovies = await db.collection('movies').find({
      $or: [{ name: /paradise/i }, { title: /paradise/i }]
    }).toArray();
    const pIds = paradiseMovies.map(m => m._id);

    const startUtc = new Date("2026-09-24T18:30:00.000Z"); // 2026-09-25 00:00:00 IST
    const endUtc = new Date("2026-09-28T18:29:59.999Z");   // 2026-09-28 23:59:59 IST

    const allParadiseWeekend = await db.collection('transactions').find({
      $or: [
        { movieId: { $in: pIds } },
        { "movieData.name": /paradise/i }
      ],
      createdAt: { $gte: startUtc, $lte: endUtc }
    }).toArray();

    console.log(`\n=== Total Paradise tx over weekend (all sources): ${allParadiseWeekend.length} ===`);
    const pUtmBreakdown = {};
    for (const t of allParadiseWeekend) {
      const src = t.utm_source || 'null';
      const stat = t.status;
      const key = `utm: ${src} | status: ${stat}`;
      pUtmBreakdown[key] = (pUtmBreakdown[key] || 0) + 1;
    }
    console.log("Paradise weekend breakdown by UTM & status:", pUtmBreakdown);

    // Let's also check if Paradise had ANY status: 1 transactions over the weekend
    const pConfirmed = allParadiseWeekend.filter(t => t.status === 1);
    console.log(`Total confirmed Paradise bookings over the weekend: ${pConfirmed.length}`);
    for (const pc of pConfirmed) {
      console.log(`Paradise confirmed: ID: ${pc._id}, createdAt: ${pc.createdAt}, utm: ${pc.utm_source}, amount: ${pc.finalBookingCalculation?.ticketCart?.ticketTotal}`);
    }

    await mongoose.disconnect();
  } catch (e) {
    console.error(e);
  }
}

run();
