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

function toISTTimeOnly(date) {
  if (!date) return 'N/A';
  const d = new Date(date);
  return d.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: true });
}

async function run() {
  try {
    await mongoose.connect('mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin');
    const db = mongoose.connection.db;

    // 1. Fetch matching movies
    const movies = await db.collection('movies').find({
      $or: [
        { name: { $regex: /ramayan/i } },
        { title: { $regex: /ramayan/i } },
        { movieName: { $regex: /ramayan/i } }
      ]
    }).toArray();
    const movieIds = movies.map(m => m._id);
    const movieMap = new Map(movies.map(m => [m._id.toString(), m.name || m.title || m.movieName]));

    // 2. Fetch shows
    const shows = await db.collection('shows').find({
      $or: [
        { filmObjectId: { $in: movieIds } },
        { movieId: { $in: movieIds } },
        { movieName: { $regex: /ramayan/i } },
        { 'movieData.name': { $regex: /ramayan/i } }
      ]
    }).toArray();
    const showMap = new Map(shows.map(s => [s._id.toString(), s]));
    for (const s of shows) {
      if (s.filmObjectId) movieIds.push(s.filmObjectId);
      if (s.movieId) movieIds.push(s.movieId);
    }

    // 3. Fetch transactions
    const query = {
      utm_source: { $regex: /whatsapp/i },
      $or: [
        { movieId: { $in: movieIds } },
        { showId: { $in: Array.from(showMap.keys()).map(id => {
          try { return new mongoose.Types.ObjectId(id); } catch(e) { return id; }
        }) } },
        { movieName: { $regex: /ramayan/i } },
        { 'movieData.name': { $regex: /ramayan/i } }
      ]
    };

    const allTx = await db.collection('transactions').find(query).sort({ createdAt: -1 }).toArray();

    // Collect cinema IDs
    const cinemaIds = allTx.map(t => t.cinemaId).filter(Boolean);
    for (const s of shows) {
      if (s.cinemaObjectId) cinemaIds.push(s.cinemaObjectId);
      if (s.cinemaId) cinemaIds.push(s.cinemaId);
    }
    const cinemas = await db.collection('cinemas').find({ _id: { $in: cinemaIds } }).toArray();
    const cinemaMap = new Map(cinemas.map(c => [c._id.toString(), c.name || c.cinemaName]));

    // Collect user IDs
    const userIds = allTx.map(t => t.userId).filter(Boolean);
    const users = await db.collection('users').find({ _id: { $in: userIds } }).toArray();
    const userMap = new Map(users.map(u => [u._id.toString(), u]));

    const records = allTx.map((t, idx) => {
      const show = t.showId ? showMap.get(t.showId.toString()) : null;
      let movieName = movieMap.get(t.movieId?.toString()) || t.movieData?.name || t.movieData?.title || t.movieName;
      if (!movieName && show) {
        movieName = movieMap.get(show.filmObjectId?.toString()) || movieMap.get(show.movieId?.toString()) || show.movieData?.name || show.movieName;
      }
      if (!movieName) movieName = 'Ramayana (Unspecified)';

      let cinemaName = cinemaMap.get(t.cinemaId?.toString()) || t.cinemaData?.name;
      if (!cinemaName && show) {
        cinemaName = cinemaMap.get(show.cinemaObjectId?.toString()) || cinemaMap.get(show.cinemaId?.toString()) || show.cinemaName;
      }
      if (!cinemaName) cinemaName = t.city ? `Connplex Cinemas - ${t.city}` : 'Unknown Cinema';

      const user = t.userId ? userMap.get(t.userId.toString()) : null;
      const userName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'N/A' : 'N/A';
      const userPhone = user?.mobileNumber || t.normalized_phone || user?.phoneNumber || 'N/A';
      const userEmail = user?.email || 'N/A';

      // Confirmed status: status === 1 OR (paymentsStatus === true && commitStatus === true)
      const isConfirmed = (t.status === 1 || (t.paymentsStatus === true && t.commitStatus === true));
      const isPaymentSuccess = t.paymentsStatus === true || t.paymentResponse?.status === 'captured';

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

      // Amounts
      const ticketTotal = Number(t.commitBookingData?.curTicketsTotal ?? t.finalBookingCalculation?.ticketCart?.ticketTotal ?? 0) || 0;
      const fnbTotal = Number(t.commitBookingData?.curFoodTotal ?? t.finalBookingCalculation?.foodCart?.fnbTotal ?? t.finalBookingCalculation?.fnbTotal ?? 0) || 0;
      const convFee = Number(t.finalBookingCalculation?.convenienceFeesObject?.total ?? t.finalBookingCalculation?.convenienceFee ?? 0) || 0;
      const finalAmount = Number(t.finalBookingCalculation?.finalAmount ?? t.finalPrice ?? (t.paymentResponse?.amount ? t.paymentResponse.amount / 100 : t.amount) ?? 0) || 0;

      const bookingId = t.commitBookingData?.strBookId || t.commitBookingData?.strBookIdEx || t.bookingId || t.addSeatData?.strBookId || 'N/A';
      const paymentId = t.paymentResponse?.razorpay_payment_id || t.paymentResponse?.id || t.razorpayPaymentId || 'N/A';
      const orderId = t.razorpayOrderId || t.paymentResponse?.razorpay_order_id || 'N/A';

      // Show details
      const showRawDate = show?.sessionRealShow || show?.sessionFilmFirstShow;
      const showDate = showRawDate ? toISTDateOnly(showRawDate) : 'N/A';
      const showTime = showRawDate ? toISTTimeOnly(showRawDate) : 'N/A';
      const screenName = show?.screenName || 'N/A';

      return {
        srNo: idx + 1,
        txId: t._id.toString(),
        createdAtIST: toIST(t.createdAt),
        dateIST: toISTDateOnly(t.createdAt),
        movieName,
        cinemaName,
        city: t.city || 'N/A',
        screenName,
        showDate,
        showTime,
        seats: seatsStr,
        ticketCount,
        ticketTotal,
        fnbTotal,
        convFee,
        finalAmount,
        bookingId,
        paymentId,
        orderId,
        status: t.status,
        paymentsStatus: t.paymentsStatus,
        commitStatus: t.commitStatus,
        isConfirmed,
        isPaymentSuccess,
        userName,
        userPhone,
        userEmail,
        bookedFrom: t.bookedFrom || 'N/A',
        utm_source: t.utm_source,
        utm_campaign: t.utm_campaign || 'N/A',
        utm_medium: t.utm_medium || 'N/A'
      };
    });

    const confirmedList = records.filter(r => r.isConfirmed);
    const pendingFailedList = records.filter(r => !r.isConfirmed);

    // Save full JSON
    fs.writeFileSync('scratch/ramayana_wa_all_records.json', JSON.stringify(records, null, 2));
    fs.writeFileSync('scratch/ramayana_wa_confirmed.json', JSON.stringify(confirmedList, null, 2));

    // Create CSV of confirmed records
    const headersConfirmed = [
      'Sr No', 'Booking ID', 'Transaction ID', 'Booking Date (IST)', 'Customer Name', 'Customer Phone',
      'Movie Name', 'Cinema Name', 'City', 'Screen', 'Show Date', 'Show Time', 'Seats',
      'Tickets', 'Ticket Total (INR)', 'F&B Total (INR)', 'Conv Fee (INR)', 'Final Total (INR)',
      'Payment ID', 'Order ID', 'UTM Source', 'UTM Campaign'
    ];

    const toCsvRow = (arr) => arr.map(val => `"${String(val ?? '').replace(/"/g, '""')}"`).join(',');

    const csvConfirmedRows = [headersConfirmed.join(',')];
    for (let i = 0; i < confirmedList.length; i++) {
      const r = confirmedList[i];
      csvConfirmedRows.push(toCsvRow([
        i + 1,
        r.bookingId,
        r.txId,
        r.createdAtIST,
        r.userName,
        r.userPhone,
        r.movieName,
        r.cinemaName,
        r.city,
        r.screenName,
        r.showDate,
        r.showTime,
        r.seats,
        r.ticketCount,
        r.ticketTotal.toFixed(2),
        r.fnbTotal.toFixed(2),
        r.convFee.toFixed(2),
        r.finalAmount.toFixed(2),
        r.paymentId,
        r.orderId,
        r.utm_source,
        r.utm_campaign
      ]));
    }
    fs.writeFileSync('scratch/ramayana_whatsapp_confirmed_bookings.csv', csvConfirmedRows.join('\n'));

    // Create CSV of ALL transactions
    const headersAll = [
      'Sr No', 'Transaction ID', 'Booking ID', 'Booking Date (IST)', 'Status', 'Confirmed',
      'Customer Name', 'Customer Phone', 'Movie Name', 'Cinema Name', 'City', 'Screen',
      'Show Date', 'Show Time', 'Seats', 'Tickets', 'Ticket Total (INR)', 'F&B Total (INR)',
      'Conv Fee (INR)', 'Final Total (INR)', 'Payment ID', 'Order ID', 'UTM Source', 'UTM Campaign'
    ];

    const csvAllRows = [headersAll.join(',')];
    for (const r of records) {
      csvAllRows.push(toCsvRow([
        r.srNo,
        r.txId,
        r.bookingId,
        r.createdAtIST,
        r.status === 1 ? 'Success (1)' : (r.isConfirmed ? 'Success (Paid)' : `Incomplete/Failed (${r.status})`),
        r.isConfirmed ? 'Yes' : 'No',
        r.userName,
        r.userPhone,
        r.movieName,
        r.cinemaName,
        r.city,
        r.screenName,
        r.showDate,
        r.showTime,
        r.seats,
        r.ticketCount,
        r.ticketTotal.toFixed(2),
        r.fnbTotal.toFixed(2),
        r.convFee.toFixed(2),
        r.finalAmount.toFixed(2),
        r.paymentId,
        r.orderId,
        r.utm_source,
        r.utm_campaign
      ]));
    }
    fs.writeFileSync('scratch/ramayana_whatsapp_all_transactions.csv', csvAllRows.join('\n'));

    console.log('Saved CSVs successfully.');
    console.log('Confirmed sample with details:');
    console.log(confirmedList.slice(0, 3).map(c => ({
      bookingId: c.bookingId,
      user: c.userName,
      phone: c.userPhone,
      cinema: c.cinemaName,
      movie: c.movieName,
      showDate: c.showDate,
      showTime: c.showTime,
      seats: c.seats,
      finalAmount: c.finalAmount
    })));

    await mongoose.disconnect();
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

run();
