import mongoose from 'mongoose';
import fs from 'fs';

async function run() {
  try {
    await mongoose.connect('mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin');
    const db = mongoose.connection.db;

    // Fetch all movies
    const movies = await db.collection('movies').find({}).toArray();
    const movieMap = new Map();
    for (const m of movies) {
      movieMap.set(m._id.toString(), m.name || m.title || m.movieName);
    }

    // Query all transactions where utm_source is whatsapp
    const txs = await db.collection('transactions').find({
      utm_source: { $regex: /whatsapp/i }
    }).sort({ createdAt: 1 }).toArray();

    console.log(`Total WhatsApp transactions: ${txs.length}`);

    // Collect showIds for any transactions that might need show lookup
    const neededShowIds = [];
    for (const t of txs) {
      if (!t.movieId && !t.movieData?.name && t.showId) {
        neededShowIds.push(t.showId);
      }
    }

    let showMap = new Map();
    if (neededShowIds.length > 0) {
      const shows = await db.collection('shows').find({ _id: { $in: neededShowIds } }).toArray();
      for (const s of shows) {
        showMap.set(s._id.toString(), s);
      }
    }

    // Detailed transaction records
    const records = [];

    for (const t of txs) {
      // IST Date calculation
      const createdAtDate = new Date(t.createdAt);
      // IST is UTC + 5.5 hours
      const istTime = new Date(createdAtDate.getTime() + 5.5 * 3600 * 1000);
      const istDateStr = istTime.toISOString().split('T')[0];
      const istDateTimeStr = istTime.toISOString().replace('T', ' ').substring(0, 19);

      // Movie Name resolution
      let movieName = null;
      if (t.movieId) {
        movieName = movieMap.get(t.movieId.toString());
      }
      if (!movieName && t.movieData?.name) {
        movieName = t.movieData.name;
      }
      if (!movieName && t.showId) {
        const s = showMap.get(t.showId.toString());
        if (s) {
          movieName = movieMap.get(s.movieId?.toString()) || s.movieData?.name || s.movieName;
        }
      }
      if (!movieName) {
        movieName = "Unknown Movie";
      }

      // Seat & ticket count resolution
      let ticketCount = 0;
      if (t.finalBookingCalculation?.ticketCart?.selectedSeats && Array.isArray(t.finalBookingCalculation.ticketCart.selectedSeats)) {
        ticketCount = t.finalBookingCalculation.ticketCart.selectedSeats.length;
      }
      if (!ticketCount) {
        const seatInfo = t.commitBookingData?.strSeatInfo || t.addSeatData?.strSeatInfo || t.setSeatData?.strSeatInfo;
        if (seatInfo && typeof seatInfo === 'string') {
          if (seatInfo.includes(' - ')) {
            const seatsPart = seatInfo.split(' - ')[1];
            ticketCount = seatsPart.split(',').map(s => s.trim()).filter(Boolean).length;
          } else if (seatInfo.includes('-')) {
            const seatsPart = seatInfo.split('-')[1];
            ticketCount = seatsPart.split(',').map(s => s.trim()).filter(Boolean).length;
          } else if (seatInfo.trim().length > 0) {
            ticketCount = seatInfo.split(',').map(s => s.trim()).filter(Boolean).length;
          }
        }
      }
      if (!ticketCount && t.addSeatData?.curTicketsTotal && t.finalBookingCalculation?.ticketCart?.basePrice) {
        // Fallback estimate if seats array wasn't saved
        ticketCount = Math.max(1, Math.round(t.addSeatData.curTicketsTotal / (t.finalBookingCalculation.ticketCart.basePrice || 200)));
      }
      if (!ticketCount && (t.status === 1 || t.commitStatus === true)) {
        ticketCount = 1; // Default minimum 1 if confirmed booking
      }

      // Revenue amounts
      const ticketRevenue = t.finalBookingCalculation?.ticketCart?.ticketTotal ??
                            t.finalBookingCalculation?.ticketCart?.total ??
                            t.addSeatData?.curTicketsTotal ??
                            0;

      const totalRevenue = t.finalBookingCalculation?.finalAmount ??
                           t.finalBookingCalculation?.totalPayableAmount ??
                           (t.paymentResponse?.amount ? (t.paymentResponse.amount / 100) : ticketRevenue);

      const isConfirmed = (t.status === 1) || (t.paymentsStatus === true && t.commitStatus === true);
      const isPaidFailed = (t.status === 4) || (t.paymentsStatus === true && t.commitStatus !== true);

      records.push({
        id: t._id.toString(),
        createdAtUTC: t.createdAt,
        istDate: istDateStr,
        istDateTime: istDateTimeStr,
        status: t.status,
        paymentsStatus: t.paymentsStatus,
        commitStatus: t.commitStatus,
        isConfirmed,
        isPaidFailed,
        movieName: movieName.trim(),
        ticketCount,
        ticketRevenue,
        totalRevenue,
        strBookId: t.commitBookingData?.strBookId || t.addSeatData?.strBookId,
        intBookId: t.commitBookingData?.intBookId || t.addSeatData?.intBookId,
        paymentId: t.razorpayPaymentId || t.paymentResponse?.razorpay_payment_id
      });
    }

    console.log(`Processed ${records.length} records.`);

    // Write all records to json for inspectability
    fs.writeFileSync('c:/Users/admin/Downloads/Connplex-B2C/scratch/wa_records.json', JSON.stringify(records, null, 2));

    // Filter confirmed bookings
    const confirmedRecords = records.filter(r => r.isConfirmed);
    console.log(`Confirmed bookings count: ${confirmedRecords.length}`);

    // Check date range
    if (confirmedRecords.length > 0) {
      console.log(`First confirmed booking date: ${confirmedRecords[0].istDateTime}`);
      console.log(`Last confirmed booking date: ${confirmedRecords[confirmedRecords.length - 1].istDateTime}`);
    }

    // Check movie names list
    const uniqueMovies = [...new Set(confirmedRecords.map(r => r.movieName))];
    console.log("Unique movies in confirmed bookings:", uniqueMovies);

    // Grouping: Date wise and Movie wise
    // Key: date -> movie -> { bookings, tickets, ticketRevenue, totalRevenue }
    const dateMovieMap = {};

    for (const r of confirmedRecords) {
      if (!dateMovieMap[r.istDate]) {
        dateMovieMap[r.istDate] = {};
      }
      if (!dateMovieMap[r.istDate][r.movieName]) {
        dateMovieMap[r.istDate][r.movieName] = {
          bookings: 0,
          tickets: 0,
          ticketRevenue: 0,
          totalRevenue: 0
        };
      }
      const entry = dateMovieMap[r.istDate][r.movieName];
      entry.bookings += 1;
      entry.tickets += r.ticketCount;
      entry.ticketRevenue += r.ticketRevenue;
      entry.totalRevenue += r.totalRevenue;
    }

    // Also Movie Wise Total Summary
    const movieTotals = {};
    for (const r of confirmedRecords) {
      if (!movieTotals[r.movieName]) {
        movieTotals[r.movieName] = {
          bookings: 0,
          tickets: 0,
          ticketRevenue: 0,
          totalRevenue: 0
        };
      }
      movieTotals[r.movieName].bookings += 1;
      movieTotals[r.movieName].tickets += r.ticketCount;
      movieTotals[r.movieName].ticketRevenue += r.ticketRevenue;
      movieTotals[r.movieName].totalRevenue += r.totalRevenue;
    }

    // Also Date Wise Total Summary
    const dateTotals = {};
    for (const r of confirmedRecords) {
      if (!dateTotals[r.istDate]) {
        dateTotals[r.istDate] = {
          bookings: 0,
          tickets: 0,
          ticketRevenue: 0,
          totalRevenue: 0
        };
      }
      dateTotals[r.istDate].bookings += 1;
      dateTotals[r.istDate].tickets += r.ticketCount;
      dateTotals[r.istDate].ticketRevenue += r.ticketRevenue;
      dateTotals[r.istDate].totalRevenue += r.totalRevenue;
    }

    // Overall Totals
    const grandTotal = {
      bookings: confirmedRecords.length,
      tickets: confirmedRecords.reduce((sum, r) => sum + r.ticketCount, 0),
      ticketRevenue: confirmedRecords.reduce((sum, r) => sum + r.ticketRevenue, 0),
      totalRevenue: confirmedRecords.reduce((sum, r) => sum + r.totalRevenue, 0)
    };

    const outputData = {
      grandTotal,
      dateTotals,
      movieTotals,
      dateMovieMap
    };

    fs.writeFileSync('c:/Users/admin/Downloads/Connplex-B2C/scratch/wa_summary.json', JSON.stringify(outputData, null, 2));
    console.log("Written wa_summary.json successfully.");
    console.log("Grand Total:", grandTotal);

    await mongoose.disconnect();
  } catch (err) {
    console.error("Error:", err);
  }
}

run();
