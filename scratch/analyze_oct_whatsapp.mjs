import mongoose from 'mongoose';
import fs from 'fs';

function toIST(date) {
  if (!date) return 'N/A';
  const d = new Date(date);
  return d.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' });
}

function toISTDateOnly(date) {
  if (!date) return 'N/A';
  const d = new Date(date);
  return d.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }); // YYYY-MM-DD
}

async function run() {
  try {
    await mongoose.connect('mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin');
    const db = mongoose.connection.db;

    // October 1 00:00:00 IST to October 31 23:59:59.999 IST
    const octStart = new Date('2026-09-30T18:30:00.000Z');
    const octEnd = new Date('2026-10-31T18:29:59.999Z');

    // Fetch only October transactions with utm_source regex /whatsapp/i
    const allOctWaTx = await db.collection('transactions').find({
      createdAt: { $gte: octStart, $lte: octEnd },
      utm_source: { $regex: /whatsapp/i }
    }).sort({ createdAt: 1 }).toArray();

    // Collect IDs
    const movieIds = allOctWaTx.map(t => t.movieId).filter(Boolean);
    const showIds = allOctWaTx.map(t => t.showId).filter(Boolean);
    const cinemaIds = allOctWaTx.map(t => t.cinemaId).filter(Boolean);

    // Fetch shows
    const shows = await db.collection('shows').find({ _id: { $in: showIds } }).toArray();
    const showMap = new Map(shows.map(s => [s._id.toString(), s]));
    for (const s of shows) {
      if (s.filmObjectId) movieIds.push(s.filmObjectId);
      if (s.movieId) movieIds.push(s.movieId);
      if (s.cinemaObjectId) cinemaIds.push(s.cinemaObjectId);
    }

    // Fetch movies
    const movies = await db.collection('movies').find({ _id: { $in: movieIds } }).toArray();
    const movieMap = new Map(movies.map(m => [m._id.toString(), m.name || m.title || m.movieName]));

    // Fetch cinemas
    const cinemas = await db.collection('cinemas').find({ _id: { $in: cinemaIds } }).toArray();
    const cinemaMap = new Map(cinemas.map(c => [c._id.toString(), c.name || c.cinemaName]));

    // Confirmed bookings: status 1 OR (paymentsStatus === true && commitStatus === true)
    const confirmedTx = allOctWaTx.filter(t => t.status === 1 || (t.paymentsStatus === true && t.commitStatus === true));

    // Process each confirmed booking
    const processedConfirmed = confirmedTx.map((t, idx) => {
      const show = t.showId ? showMap.get(t.showId.toString()) : null;
      let movieName = movieMap.get(t.movieId?.toString()) || t.movieData?.name || t.movieData?.title || t.movieName;
      if (!movieName && show) {
        movieName = movieMap.get(show.filmObjectId?.toString()) || movieMap.get(show.movieId?.toString()) || show.movieData?.name || show.movieName;
      }
      if (!movieName) movieName = 'Other / Unspecified Movie';

      let cinemaName = cinemaMap.get(t.cinemaId?.toString()) || t.cinemaData?.name;
      if (!cinemaName && show) {
        cinemaName = cinemaMap.get(show.cinemaObjectId?.toString()) || cinemaMap.get(show.cinemaId?.toString());
      }
      if (!cinemaName) cinemaName = 'Unknown Cinema';

      // Seats & ticket count
      let ticketCount = 0;
      let seatsStr = '';
      if (t.finalBookingCalculation?.ticketCart?.selectedSeats?.length) {
        ticketCount = t.finalBookingCalculation.ticketCart.selectedSeats.length;
        seatsStr = t.finalBookingCalculation.ticketCart.selectedSeats.map(s => `${s.strRowName || s.rowName || ''}${s.intSeatNumber || s.seatNumber || ''}`).join(', ');
      } else {
        const rawSeats = t.commitBookingData?.strSeatInfo || t.addSeatData?.strSeatInfo || t.setSeatData?.strSeatInfo;
        if (rawSeats) {
          seatsStr = rawSeats;
          if (rawSeats.includes('-')) {
            ticketCount = rawSeats.split('-')[1].split(',').filter(Boolean).length;
          } else {
            ticketCount = rawSeats.split(',').filter(Boolean).length;
          }
        }
      }

      // Amounts strictly parsed as numbers
      const ticketTotal = Number(t.commitBookingData?.curTicketsTotal ?? t.finalBookingCalculation?.ticketCart?.ticketTotal ?? 0) || 0;
      const fnbTotal = Number(t.commitBookingData?.curFoodTotal ?? t.finalBookingCalculation?.foodCart?.fnbTotal ?? t.finalBookingCalculation?.fnbTotal ?? 0) || 0;
      const convFee = Number(t.finalBookingCalculation?.convenienceFeesObject?.total ?? t.finalBookingCalculation?.convenienceFee ?? 0) || 0;
      const finalAmount = Number(t.finalBookingCalculation?.finalAmount ?? (t.paymentResponse?.amount ? t.paymentResponse.amount / 100 : t.amount) ?? 0) || 0;

      const dateIST = toISTDateOnly(t.createdAt);

      return {
        srNo: idx + 1,
        id: t._id.toString(),
        bookingId: t.commitBookingData?.strBookId || t.commitBookingData?.strBookIdEx || t.bookingId || 'N/A',
        createdAtIST: toIST(t.createdAt),
        dateIST,
        movieName: movieName.trim(),
        cinemaName: cinemaName.trim(),
        ticketCount: Number(ticketCount),
        seatsStr,
        ticketTotal: Math.round(ticketTotal * 100) / 100,
        fnbTotal: Math.round(fnbTotal * 100) / 100,
        convFee: Math.round(convFee * 100) / 100,
        finalAmount: Math.round(finalAmount * 100) / 100,
        contact: t.paymentResponse?.contact || t.userPhone || 'N/A'
      };
    });

    // Group by Movie
    const movieBreakdown = {};
    for (const b of processedConfirmed) {
      if (!movieBreakdown[b.movieName]) {
        movieBreakdown[b.movieName] = {
          movieName: b.movieName,
          bookings: 0,
          tickets: 0,
          ticketRevenue: 0,
          fnbRevenue: 0,
          convFee: 0,
          totalRevenue: 0
        };
      }
      const mb = movieBreakdown[b.movieName];
      mb.bookings += 1;
      mb.tickets += b.ticketCount;
      mb.ticketRevenue += b.ticketTotal;
      mb.fnbRevenue += b.fnbTotal;
      mb.convFee += b.convFee;
      mb.totalRevenue += b.finalAmount;
    }

    // Group by Date
    const dateBreakdown = {};
    for (const b of processedConfirmed) {
      if (!dateBreakdown[b.dateIST]) {
        dateBreakdown[b.dateIST] = {
          date: b.dateIST,
          bookings: 0,
          tickets: 0,
          ticketRevenue: 0,
          totalRevenue: 0
        };
      }
      const db = dateBreakdown[b.dateIST];
      db.bookings += 1;
      db.tickets += b.ticketCount;
      db.ticketRevenue += b.ticketTotal;
      db.totalRevenue += b.finalAmount;
    }

    // Totals
    const grandTotals = {
      totalSessions: allOctWaTx.length,
      totalBookings: processedConfirmed.length,
      totalTickets: processedConfirmed.reduce((sum, b) => sum + b.ticketCount, 0),
      totalTicketRevenue: Math.round(processedConfirmed.reduce((sum, b) => sum + b.ticketTotal, 0) * 100) / 100,
      totalFnbRevenue: Math.round(processedConfirmed.reduce((sum, b) => sum + b.fnbTotal, 0) * 100) / 100,
      totalConvFee: Math.round(processedConfirmed.reduce((sum, b) => sum + b.convFee, 0) * 100) / 100,
      grandTotalRevenue: Math.round(processedConfirmed.reduce((sum, b) => sum + b.finalAmount, 0) * 100) / 100
    };

    console.log('\n================ OCT 2026 GRAND TOTALS ================');
    console.log(JSON.stringify(grandTotals, null, 2));

    console.log('\n================ BY MOVIE ================');
    const sortedMovies = Object.values(movieBreakdown).sort((a, b) => b.totalRevenue - a.totalRevenue).map(m => ({
      ...m,
      ticketRevenue: Math.round(m.ticketRevenue * 100) / 100,
      fnbRevenue: Math.round(m.fnbRevenue * 100) / 100,
      convFee: Math.round(m.convFee * 100) / 100,
      totalRevenue: Math.round(m.totalRevenue * 100) / 100
    }));
    console.table(sortedMovies);

    console.log('\n================ BY DATE ================');
    const sortedDates = Object.values(dateBreakdown).sort((a, b) => a.date.localeCompare(b.date)).map(d => ({
      ...d,
      ticketRevenue: Math.round(d.ticketRevenue * 100) / 100,
      totalRevenue: Math.round(d.totalRevenue * 100) / 100
    }));
    console.table(sortedDates);

    // Write full output to scratch and root
    fs.writeFileSync('scratch/oct_wa_confirmed_bookings.json', JSON.stringify(processedConfirmed, null, 2));
    fs.writeFileSync('scratch/oct_wa_movie_summary.json', JSON.stringify({ grandTotals, sortedMovies, sortedDates }, null, 2));

    const csvHeader = [
      'Sr No', 'Transaction ID', 'Booking ID', 'Booking Time (IST)', 'Date (IST)',
      'Movie Name', 'Cinema Name', 'Tickets', 'Seats', 'Ticket Revenue (₹)', 'F&B Revenue (₹)', 'Conv Fee (₹)', 'Total Revenue (₹)', 'Contact'
    ];
    const csvRows = processedConfirmed.map(b => [
      b.srNo,
      `"${b.id}"`,
      `"${b.bookingId}"`,
      `"${b.createdAtIST}"`,
      `"${b.dateIST}"`,
      `"${b.movieName}"`,
      `"${b.cinemaName}"`,
      b.ticketCount,
      `"${b.seatsStr}"`,
      b.ticketTotal,
      b.fnbTotal,
      b.convFee,
      b.finalAmount,
      `"${b.contact}"`
    ].join(','));

    fs.writeFileSync('./October_WhatsApp_UTM_Report.csv', [csvHeader.join(','), ...csvRows].join('\n'), 'utf-8');
    console.log('Saved CSV report to October_WhatsApp_UTM_Report.csv');

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

run();
