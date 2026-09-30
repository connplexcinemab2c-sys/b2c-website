import mongoose from 'mongoose';
import fs from 'fs';

async function run() {
  try {
    await mongoose.connect('mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin');
    const db = mongoose.connection.db;

    // Find all movie IDs for Paradise and Vvaan
    const movies = await db.collection('movies').find({
      $or: [
        { name: /paradise/i },
        { title: /paradise/i },
        { name: /vvaan/i },
        { title: /vvaan/i }
      ]
    }).toArray();

    const movieMap = new Map();
    const movieIds = [];
    for (const m of movies) {
      movieIds.push(m._id);
      movieMap.set(m._id.toString(), m.name || m.title);
    }

    const cinemas = await db.collection('cinemas').find({}).toArray();
    const cinemaMap = new Map();
    for (const c of cinemas) {
      cinemaMap.set(c._id.toString(), c.name || c.cinemaName);
    }

    // Let's query all transactions where utm_source regex /whatsapp/i
    // for Paradise & Vvaan from 2026-09-25T00:00:00+05:30 to 2026-09-28T23:59:59+05:30
    const startUtc = new Date("2026-09-24T18:30:00.000Z"); // 2026-09-25 00:00:00 IST
    const endUtc = new Date("2026-09-28T18:29:59.999Z");   // 2026-09-28 23:59:59 IST

    const txs = await db.collection('transactions').find({
      utm_source: { $regex: /whatsapp/i },
      $or: [
        { movieId: { $in: movieIds } },
        { "movieData.name": /paradise|vvaan/i }
      ],
      createdAt: { $gte: startUtc, $lte: endUtc }
    }).sort({ createdAt: 1 }).toArray();

    console.log(`Found ${txs.length} transactions for Paradise and Vvaan over the weekend.`);

    const detailedList = [];

    for (const tx of txs) {
      // Find show if showId exists
      let showDoc = null;
      if (tx.showId) {
        showDoc = await db.collection('shows').findOne({ _id: tx.showId });
      }

      const istDate = new Date(new Date(tx.createdAt).getTime() + 5.5 * 3600 * 1000).toISOString().replace('T', ' ').substring(0, 19);
      const movieName = movieMap.get(tx.movieId?.toString()) || tx.movieData?.name || "Unknown Movie";
      const isParadise = /paradise/i.test(movieName);
      const movieCategory = isParadise ? "The Paradise" : "The Vvaan";
      const cinemaName = cinemaMap.get(tx.cinemaId?.toString()) || tx.cinemaData?.name || tx.cinemaData?.cinemaName || "Unknown Cinema";

      // Status text:
      let statusText = "Initiated / Incomplete";
      if (tx.status === 1) statusText = "Booked (Confirmed)";
      else if (tx.status === 2 || tx.status === 7) statusText = "Cancelled";
      else if (tx.status === 3) statusText = "Refunded";
      else if (tx.status === 4) statusText = "Payment Done, Booking Failed";
      else if (tx.status === 5) statusText = "Payment Failed";
      else if (tx.status === 6) statusText = "Timeout (Vista Pending)";

      // Seat info:
      let seatInfo = "";
      if (typeof tx.addSeatData?.strSeatInfo === 'string') seatInfo = tx.addSeatData.strSeatInfo;
      else if (typeof tx.commitBookingData?.strSeatInfo === 'string') seatInfo = tx.commitBookingData.strSeatInfo;
      else if (typeof tx.commitBookingData === 'string') seatInfo = tx.commitBookingData;

      // Quantity / tickets:
      let ticketsCount = 0;
      if (tx.finalBookingCalculation?.ticketCart?.selectedSeats) {
        ticketsCount = tx.finalBookingCalculation.ticketCart.selectedSeats.length;
      } else if (seatInfo) {
        // e.g. "MILLER - D5, D6" -> seats after "-"
        const parts = seatInfo.split('-');
        if (parts[1]) {
          ticketsCount = parts[1].split(',').length;
        } else {
          ticketsCount = seatInfo.split(',').length;
        }
      }

      const totalAmount = tx.finalBookingCalculation?.totalPayableAmount ??
                          tx.finalBookingCalculation?.ticketCart?.ticketTotal ??
                          (tx.paymentResponse?.amount ? tx.paymentResponse.amount / 100 : 0) ?? 0;

      const contact = tx.normalized_phone || tx.paymentResponse?.contact || tx.paymentDetail?.phone || "-";
      const email = tx.paymentResponse?.email || tx.paymentDetail?.email || "-";
      const paymentId = tx.razorpayPaymentId || tx.paymentResponse?.razorpay_payment_id || "-";

      detailedList.push({
        id: tx._id.toString(),
        initTransId: tx.initTransId || "-",
        bookingTimeIST: istDate,
        movieCategory,
        movieName,
        cinemaName,
        screenName: showDoc?.screenName || tx.showData?.screenName || "-",
        showDate: showDoc?.showDate || tx.showData?.showDate || "-",
        showTime: showDoc?.showTime || tx.showData?.showTime || "-",
        seats: seatInfo,
        ticketCount: ticketsCount,
        amount: totalAmount,
        status: tx.status,
        statusText,
        paymentsStatus: tx.paymentsStatus,
        commitStatus: tx.commitStatus,
        contact,
        email,
        paymentId,
        utm_source: tx.utm_source,
        utm_campaign: tx.utm_campaign
      });
    }

    fs.writeFileSync('c:/Users/admin/Downloads/Connplex-B2C/scratch/weekend_tx_summary.json', JSON.stringify(detailedList, null, 2));
    console.log("Written to scratch/weekend_tx_summary.json successfully.");

    // Print summary table to console
    console.log("\n=== ALL TRANSACTIONS SUMMARY ===");
    for (const d of detailedList) {
      console.log(`[${d.bookingTimeIST}] [${d.statusText}] | Movie: ${d.movieCategory} (${d.movieName}) | Cinema: ${d.cinemaName} | Seats: ${d.seats} | Amount: ₹${d.amount} | Phone: ${d.contact} | PayId: ${d.paymentId}`);
    }

    // Let's filter confirmed bookings only
    const confirmed = detailedList.filter(d => d.status === 1 || (d.paymentsStatus === true && d.commitStatus === true));
    console.log(`\n=== CONFIRMED BOOKINGS (Status 1 / paymentsStatus: true, commitStatus: true): ${confirmed.length} ===`);
    for (const c of confirmed) {
      console.log(`Confirmed: ${JSON.stringify(c, null, 2)}`);
    }

    // Filter by movie
    console.log("\n=== SUMMARY BY MOVIE & STATUS ===");
    const breakdown = {};
    for (const d of detailedList) {
      const key = `${d.movieCategory} - ${d.statusText}`;
      breakdown[key] = (breakdown[key] || 0) + 1;
    }
    console.log(breakdown);

    await mongoose.disconnect();
  } catch (err) {
    console.error("Error:", err);
  }
}

run();
