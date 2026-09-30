import mongoose from 'mongoose';
import fs from 'fs';

async function run() {
  try {
    await mongoose.connect('mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin');
    const db = mongoose.connection.db;

    // Range in IST: 2026-09-25 00:00:00 IST to 2026-09-27 23:59:59 IST
    // UTC: 2026-09-24T18:30:00.000Z to 2026-09-27T18:29:59.999Z
    const startUtc = new Date('2026-09-24T18:30:00.000Z');
    const endUtc = new Date('2026-09-27T18:29:59.999Z');

    const movies = await db.collection('movies').find({}).toArray();
    const movieMap = new Map();
    for (const m of movies) movieMap.set(m._id.toString(), m.name || m.title);

    const cinemas = await db.collection('cinemas').find({}).toArray();
    const cinemaMap = new Map();
    for (const c of cinemas) cinemaMap.set(c._id.toString(), c.name || c.cinemaName);

    // Query all transactions where utm_source is whatsapp
    const txs = await db.collection('transactions').find({
      utm_source: { $regex: /whatsapp/i },
      createdAt: { $gte: startUtc, $lte: endUtc }
    }).sort({ createdAt: 1 }).toArray();

    console.log(`Total transactions with utm_source=whatsapp on 25, 26, 27 Sept: ${txs.length}`);

    // Group by status
    const byStatus = {};
    for (const t of txs) {
      byStatus[t.status] = (byStatus[t.status] || 0) + 1;
    }
    console.log("By status:", byStatus);

    // Group by movie
    const byMovie = {};
    for (const t of txs) {
      const mName = movieMap.get(t.movieId?.toString()) || t.movieData?.name || "Unknown";
      byMovie[mName] = (byMovie[mName] || 0) + 1;
    }
    console.log("By movie:", byMovie);

    // All Confirmed Bookings (status: 1)
    const confirmed = txs.filter(t => t.status === 1 || (t.paymentsStatus === true && t.commitStatus === true));
    console.log(`\n=== CONFIRMED BOOKINGS (${confirmed.length}) ===`);

    const confirmedDetails = [];
    for (const t of confirmed) {
      const show = t.showId ? await db.collection('shows').findOne({ _id: t.showId }) : null;
      const istDate = new Date(new Date(t.createdAt).getTime() + 5.5 * 3600 * 1000).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
      const movieName = movieMap.get(t.movieId?.toString()) || t.movieData?.name || "Unknown";
      const cinemaName = cinemaMap.get(t.cinemaId?.toString()) || t.cinemaData?.name || t.cinemaData?.cinemaName || "Unknown";
      const bookData = t.commitBookingData || t.addSeatData;
      const seatInfo = bookData?.strSeatInfo || t.setSeatData?.strSeatInfo || "-";
      const bookRef = bookData?.strBookId || bookData?.strBookIdEx || t.initTransId;

      // Extract ticket count
      let ticketCount = t.finalBookingCalculation?.ticketCart?.selectedSeats?.length || 0;
      if (!ticketCount && seatInfo && seatInfo.includes('-')) {
        ticketCount = seatInfo.split('-')[1].split(',').filter(Boolean).length;
      }

      const ticketTotal = t.finalBookingCalculation?.ticketCart?.ticketTotal || 0;
      const totalPaid = t.finalBookingCalculation?.finalAmount || t.paymentResponse?.amount || 0;

      const detail = {
        txId: t._id.toString(),
        initTransId: t.initTransId,
        bookingRef: bookRef,
        bookingTimeIST: istDate,
        dateOnlyIST: new Date(new Date(t.createdAt).getTime() + 5.5 * 3600 * 1000).toISOString().split('T')[0],
        movie: movieName,
        cinema: cinemaName,
        screen: show?.screenName || "-",
        showTimingIST: show?.sessionRealShow ? new Date(new Date(show.sessionRealShow).getTime() + 5.5 * 3600 * 1000).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) : "-",
        seats: seatInfo,
        ticketCount,
        ticketTotal,
        totalPaid,
        customerPhone: t.normalized_phone || t.paymentResponse?.contact || "-",
        paymentId: t.razorpayPaymentId || t.paymentResponse?.razorpay_payment_id || "-",
        paymentMethod: t.paymentResponse?.method || "-",
        vpa: t.paymentResponse?.vpa || "-"
      };
      confirmedDetails.push(detail);
      console.log(detail);
    }

    // Now let's group all transactions by day (25, 26, 27) and movie and status
    const dayWise = {
      "2026-09-25 (Friday)": [],
      "2026-09-26 (Saturday)": [],
      "2026-09-27 (Sunday)": []
    };

    for (const t of txs) {
      const day = new Date(new Date(t.createdAt).getTime() + 5.5 * 3600 * 1000).toISOString().split('T')[0];
      const dayKey = day === "2026-09-25" ? "2026-09-25 (Friday)" :
                     day === "2026-09-26" ? "2026-09-26 (Saturday)" :
                     day === "2026-09-27" ? "2026-09-27 (Sunday)" : day;
      
      const mName = movieMap.get(t.movieId?.toString()) || t.movieData?.name || "Unknown";
      const cName = cinemaMap.get(t.cinemaId?.toString()) || t.cinemaData?.name || t.cinemaData?.cinemaName || "Unknown";
      const istTime = new Date(new Date(t.createdAt).getTime() + 5.5 * 3600 * 1000).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

      if (dayWise[dayKey]) {
        dayWise[dayKey].push({
          txId: t._id.toString(),
          timeIST: istTime,
          movie: mName,
          cinema: cName,
          status: t.status,
          amount: t.finalBookingCalculation?.ticketCart?.ticketTotal || t.finalBookingCalculation?.totalPayableAmount || 0,
          phone: t.normalized_phone || t.paymentResponse?.contact || "-"
        });
      }
    }

    console.log("\n=== DAY-WISE SUMMARY ===");
    for (const [day, list] of Object.entries(dayWise)) {
      const confCount = list.filter(x => x.status === 1).length;
      const failCount = list.filter(x => x.status === 5).length;
      const initCount = list.filter(x => x.status === 0).length;
      console.log(`\n${day}: Total Sessions = ${list.length} | Confirmed = ${confCount} | Failed = ${failCount} | Abandoned = ${initCount}`);
      for (const item of list) {
        console.log(`  [${item.timeIST}] Status ${item.status} | ${item.movie} | ${item.cinema} | ₹${item.amount} | Phone: ${item.phone}`);
      }
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

run();
