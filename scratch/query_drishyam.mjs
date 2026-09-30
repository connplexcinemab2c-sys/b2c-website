import mongoose from 'mongoose';

async function run() {
  try {
    await mongoose.connect('mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin');
    const db = mongoose.connection.db;

    console.log("Connected to DB.");

    // 1. Check WhatsApp Campaigns
    const campaigns = await db.collection('whatsappcampaigns').find({}).toArray();
    console.log(`\n=== WHATSAPP CAMPAIGNS (${campaigns.length}) ===`);
    for (const c of campaigns) {
      console.log(JSON.stringify(c, null, 2));
    }

    // 2. Check movies matching Drishyam
    const drishyamMovies = await db.collection('movies').find({
      $or: [
        { name: /drishyam/i },
        { title: /drishyam/i }
      ]
    }).toArray();

    console.log(`\n=== DRISHYAM MOVIES (${drishyamMovies.length}) ===`);
    const dMovieIds = [];
    for (const m of drishyamMovies) {
      dMovieIds.push(m._id);
      console.log(`Movie ID: ${m._id} | Name: ${m.name || m.title}`);
    }

    // 3. Cinemas map
    const cinemas = await db.collection('cinemas').find({}).toArray();
    const cinemaMap = new Map();
    for (const c of cinemas) {
      cinemaMap.set(c._id.toString(), c.name || c.cinemaName);
    }

    // 4. Query all transactions for Drishyam (from Sept 28 to Oct 1) or all time with whatsapp
    const mondayStartUtc = new Date("2026-09-27T18:30:00.000Z"); // 2026-09-28 00:00:00 IST
    
    // Check all Drishyam transactions since Monday
    const allDrishyamTxSinceMonday = await db.collection('transactions').find({
      $or: [
        { movieId: { $in: dMovieIds } },
        { "movieData.name": /drishyam/i }
      ],
      createdAt: { $gte: mondayStartUtc }
    }).sort({ createdAt: 1 }).toArray();

    console.log(`\n=== ALL DRISHYAM TRANSACTIONS SINCE MONDAY (Sept 28 - Oct 1): ${allDrishyamTxSinceMonday.length} ===`);
    for (const t of allDrishyamTxSinceMonday) {
      const istDate = new Date(new Date(t.createdAt).getTime() + 5.5 * 3600 * 1000).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
      console.log({
        _id: t._id,
        initTransId: t.initTransId,
        timeIST: istDate,
        utm_source: t.utm_source,
        utm_campaign: t.utm_campaign,
        status: t.status,
        paymentsStatus: t.paymentsStatus,
        commitStatus: t.commitStatus,
        cinema: cinemaMap.get(t.cinemaId?.toString()) || t.cinemaData?.name,
        amount: t.finalBookingCalculation?.ticketCart?.ticketTotal || t.finalBookingCalculation?.totalPayableAmount || t.paymentResponse?.amount,
        phone: t.normalized_phone || t.paymentResponse?.contact
      });
    }

    // Also check any transactions where utm_campaign or utm_source mentions drishyam or whatsapp since Monday
    const allWaTxSinceMonday = await db.collection('transactions').find({
      utm_source: { $regex: /whatsapp/i },
      createdAt: { $gte: mondayStartUtc }
    }).sort({ createdAt: 1 }).toArray();

    console.log(`\n=== ALL WHATSAPP TRANSACTIONS SINCE MONDAY (All movies): ${allWaTxSinceMonday.length} ===`);
    const waMovieCounts = {};
    for (const t of allWaTxSinceMonday) {
      const mId = t.movieId?.toString();
      const mName = drishyamMovies.find(m => m._id.toString() === mId)?.name || t.movieData?.name || mId;
      waMovieCounts[mName] = (waMovieCounts[mName] || 0) + 1;
    }
    console.log("WhatsApp Tx by Movie since Monday:", waMovieCounts);

    // Check WhatsAppOrder items for Drishyam since Monday
    const waOrders = await db.collection('whatsapporders').find({
      date: { $gte: mondayStartUtc }
    }).toArray();
    console.log(`\n=== WHATSAPP ORDERS SINCE MONDAY: ${waOrders.length} ===`);
    for (const o of waOrders) {
      console.log(JSON.stringify(o, null, 2));
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

run();
