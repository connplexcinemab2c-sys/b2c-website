import mongoose from 'mongoose';

async function run() {
  try {
    await mongoose.connect('mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin');
    const db = mongoose.connection.db;

    // Drishyam movies
    const movies = await db.collection('movies').find({
      $or: [{ name: /drishyam/i }, { title: /drishyam/i }]
    }).toArray();
    const movieIds = movies.map(m => m._id);
    const movieMap = new Map();
    for (const m of movies) movieMap.set(m._id.toString(), m.name || m.title);

    const cinemas = await db.collection('cinemas').find({}).toArray();
    const cinemaMap = new Map();
    for (const c of cinemas) cinemaMap.set(c._id.toString(), c.name || c.cinemaName);

    // Monday Sept 28, 2026 00:00:00 IST to present
    const mondayUtc = new Date("2026-09-27T18:30:00.000Z");

    // 1. Transactions for Drishyam with utm_source = whatsapp since Monday
    const drishyamWaTx = await db.collection('transactions').find({
      utm_source: { $regex: /whatsapp/i },
      $or: [
        { movieId: { $in: movieIds } },
        { "movieData.name": /drishyam/i }
      ],
      createdAt: { $gte: mondayUtc }
    }).sort({ createdAt: 1 }).toArray();

    console.log(`\n=== DRISHYAM WHATSAPP TRANSACTIONS SINCE MONDAY: ${drishyamWaTx.length} ===`);

    for (const t of drishyamWaTx) {
      const istDate = new Date(new Date(t.createdAt).getTime() + 5.5 * 3600 * 1000).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
      const cinemaName = cinemaMap.get(t.cinemaId?.toString()) || t.cinemaData?.name || "Unknown Cinema";
      const bookData = t.commitBookingData || t.addSeatData;
      const seatInfo = bookData?.strSeatInfo || t.setSeatData?.strSeatInfo || "-";
      const bookRef = bookData?.strBookId || bookData?.strBookIdEx || t.initTransId;

      console.log("--------------------------------------------------");
      console.log(`TxID: ${t._id} | InitTransId: ${t.initTransId}`);
      console.log(`Time (IST): ${istDate}`);
      console.log(`Status: ${t.status} (paymentsStatus: ${t.paymentsStatus}, commitStatus: ${t.commitStatus})`);
      console.log(`Cinema: ${cinemaName}`);
      console.log(`Seats: ${seatInfo}`);
      console.log(`Amount: Ticket Total: ₹${t.finalBookingCalculation?.ticketCart?.ticketTotal || 0} | Total Paid/Payable: ₹${t.finalBookingCalculation?.finalAmount || t.paymentResponse?.amount || 0}`);
      console.log(`Phone: ${t.normalized_phone || t.paymentResponse?.contact || "-"}`);
      console.log(`Payment ID: ${t.razorpayPaymentId || t.paymentResponse?.razorpay_payment_id || "-"}`);
      console.log(`Order ID: ${bookRef}`);
      console.log(`UTM: source=${t.utm_source}, campaign=${t.utm_campaign}`);
    }

    // 2. Breakdown of all Drishyam WhatsApp transactions by status
    const statusCounts = {};
    for (const t of drishyamWaTx) {
      const s = t.status === 1 ? "1 (Confirmed)" : t.status === 5 ? "5 (Payment Failed)" : `${t.status} (Initiated/Abandoned)`;
      statusCounts[s] = (statusCounts[s] || 0) + 1;
    }
    console.log("\nStatus breakdown of Drishyam WhatsApp transactions:", statusCounts);

    // 3. Check ALL Drishyam transactions (including direct/organic) since Monday
    const allDrishyamTx = await db.collection('transactions').find({
      $or: [
        { movieId: { $in: movieIds } },
        { "movieData.name": /drishyam/i }
      ],
      createdAt: { $gte: mondayUtc }
    }).toArray();

    console.log(`\n=== ALL DRISHYAM TRANSACTIONS SINCE MONDAY (All UTM sources): ${allDrishyamTx.length} ===`);
    const utmBreakdown = {};
    for (const t of allDrishyamTx) {
      const src = t.utm_source || 'direct';
      const stat = t.status === 1 ? 'Confirmed' : t.status === 5 ? 'Failed' : 'Abandoned';
      const key = `${src} - ${stat}`;
      utmBreakdown[key] = (utmBreakdown[key] || 0) + 1;
    }
    console.log("Breakdown by UTM & Status:", utmBreakdown);

    // 4. Any confirmed Drishyam WhatsApp bookings ever?
    const allTimeDrishyamWaConfirmed = await db.collection('transactions').find({
      utm_source: { $regex: /whatsapp/i },
      $or: [
        { movieId: { $in: movieIds } },
        { "movieData.name": /drishyam/i }
      ],
      status: 1
    }).toArray();
    console.log(`\nAll-time confirmed Drishyam WhatsApp bookings: ${allTimeDrishyamWaConfirmed.length}`);

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

run();
