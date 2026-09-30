import mongoose from 'mongoose';

async function run() {
  try {
    await mongoose.connect('mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin');
    const db = mongoose.connection.db;

    const startUtc = new Date('2026-09-24T18:30:00.000Z');
    const endUtc = new Date('2026-09-28T18:29:59.999Z');

    // Check distinct utm_source over this weekend across ALL transactions
    const weekendUtms = await db.collection('transactions').distinct('utm_source', {
      createdAt: { $gte: startUtc, $lte: endUtc }
    });
    console.log('Weekend distinct utm_source:', weekendUtms);

    // Check transactions with is_whatsapp_conversion: true
    const waConversions = await db.collection('transactions').find({
      is_whatsapp_conversion: true,
      createdAt: { $gte: startUtc, $lte: endUtc }
    }).toArray();
    console.log('is_whatsapp_conversion: true count:', waConversions.length);
    for (const c of waConversions) {
      console.log(c._id, c.initTransId, c.utm_source, c.status, c.movieId);
    }

    // Check if there are ANY confirmed bookings with utm_source = whatsapp across ALL movies this weekend
    const allWaConfirmed = await db.collection('transactions').find({
      utm_source: { $regex: /whatsapp/i },
      status: 1,
      createdAt: { $gte: startUtc, $lte: endUtc }
    }).toArray();
    console.log('Total confirmed bookings with utm_source=whatsapp across all movies:', allWaConfirmed.length);
    for (const c of allWaConfirmed) {
      const movie = await db.collection('movies').findOne({ _id: c.movieId });
      const cinema = await db.collection('cinemas').findOne({ _id: c.cinemaId });
      console.log(`Confirmed WA booking: Movie: ${movie?.name} | Cinema: ${cinema?.name || cinema?.cinemaName} | Amount: ${c.finalBookingCalculation?.ticketCart?.ticketTotal} | TxID: ${c._id}`);
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

run();
