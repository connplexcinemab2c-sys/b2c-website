import mongoose from 'mongoose';

async function run() {
  try {
    await mongoose.connect('mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin');
    const db = mongoose.connection.db;

    console.log("Connected to MongoDB successfully.");

    // 1. Check cinemas
    const cinemas = await db.collection('cinemas').find({}).toArray();
    console.log("\n=== MATCHING CINEMAS ===");
    for (const c of cinemas) {
      const str = JSON.stringify(c);
      if (/paradise|vvaan|vaan/i.test(str)) {
        console.log(`Cinema: _id: ${c._id}, name: ${c.name || c.cinemaName}, city: ${c.city}, region: ${c.regionId}`);
      }
    }

    // 2. Check movies
    const movies = await db.collection('movies').find({}).toArray();
    console.log("\n=== MATCHING MOVIES ===");
    for (const m of movies) {
      const str = JSON.stringify(m);
      if (/paradise|vvaan|vaan/i.test(str)) {
        console.log(`Movie: _id: ${m._id}, name: ${m.name || m.title || m.movieName}`);
      }
    }

    // 3. Check utm_source values in transactions
    const distinctUtm = await db.collection('transactions').distinct('utm_source');
    console.log("\n=== DISTINCT utm_source IN TRANSACTIONS ===");
    console.log(distinctUtm);

    // 4. Check transactions with utm_source = whatsapp (case insensitive)
    const whatsappTxCount = await db.collection('transactions').countDocuments({
      utm_source: { $regex: /whatsapp/i }
    });
    console.log(`\nTotal transactions with utm_source matching whatsapp: ${whatsappTxCount}`);

    // Check recent transactions with utm_source matching whatsapp
    const recentTx = await db.collection('transactions').find({
      utm_source: { $regex: /whatsapp/i }
    }).sort({ createdAt: -1 }).limit(20).toArray();

    console.log(`\nRecent 20 WhatsApp transactions:`);
    for (const t of recentTx) {
      console.log({
        _id: t._id,
        createdAt: t.createdAt,
        status: t.status,
        paymentsStatus: t.paymentsStatus,
        commitStatus: t.commitStatus,
        cinemaId: t.cinemaId,
        cinemaData: t.cinemaData?.name || t.cinemaData?.cinemaName,
        movieData: t.movieData?.name,
        movieId: t.movieId,
        utm_source: t.utm_source,
        utm_campaign: t.utm_campaign,
        amount: t.finalBookingCalculation?.ticketCart?.ticketTotal || t.finalBookingCalculation?.totalPayableAmount || t.paymentResponse?.amount,
        phone: t.normalized_phone || t.paymentResponse?.contact
      });
    }

    // 5. Also check WhatsAppBooking collection
    const waBookingsCount = await db.collection('whatsappbookings').countDocuments();
    console.log(`\nTotal docs in whatsappbookings: ${waBookingsCount}`);
    if (waBookingsCount > 0) {
      const waDocs = await db.collection('whatsappbookings').find({}).sort({ createdAt: -1 }).limit(10).toArray();
      console.log("Recent WhatsAppBookings:", waDocs);
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error("Error:", err);
  }
}

run();
