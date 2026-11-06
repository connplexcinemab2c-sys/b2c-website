import mongoose from 'mongoose';
import fs from 'fs';

function toIST(date) {
  if (!date) return 'N/A';
  const d = new Date(date);
  return d.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' });
}

async function run() {
  try {
    await mongoose.connect('mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin');
    const db = mongoose.connection.db;

    // Find movies
    const movies = await db.collection('movies').find({
      $or: [
        { name: { $regex: /ramayan/i } },
        { title: { $regex: /ramayan/i } },
        { movieName: { $regex: /ramayan/i } }
      ]
    }).toArray();
    const movieIds = movies.map(m => m._id);
    const movieMap = new Map(movies.map(m => [m._id.toString(), m]));

    // Shows
    const shows = await db.collection('shows').find({
      $or: [
        { movieId: { $in: movieIds } },
        { filmObjectId: { $in: movieIds } },
        { 'movieData.name': { $regex: /ramayan/i } },
        { movieName: { $regex: /ramayan/i } }
      ]
    }).toArray();
    const showIds = shows.map(s => s._id);
    const showMap = new Map(shows.map(s => [s._id.toString(), s]));

    // Also get all show IDs present in transactions to be 100% sure we fetch any missing shows
    const allWaTx = await db.collection('transactions').find({
      utm_source: { $regex: /whatsapp/i },
      $or: [
        { movieId: { $in: movieIds } },
        { showId: { $in: showIds } },
        { 'movieData.name': { $regex: /ramayan/i } },
        { movieName: { $regex: /ramayan/i } }
      ]
    }).sort({ createdAt: -1 }).toArray();

    const additionalShowIds = allWaTx.map(t => t.showId).filter(Boolean);
    const missingShows = await db.collection('shows').find({ _id: { $in: additionalShowIds } }).toArray();
    for (const s of missingShows) {
      showMap.set(s._id.toString(), s);
      if (s.filmObjectId && !movieMap.has(s.filmObjectId.toString())) {
        const m = await db.collection('movies').findOne({ _id: s.filmObjectId });
        if (m) movieMap.set(m._id.toString(), m);
      }
    }

    // Cinemas
    const cinemas = await db.collection('cinemas').find().toArray();
    const cinemaMap = new Map(cinemas.map(c => [c._id.toString(), c]));

    // Users
    const userIds = allWaTx.map(t => t.userId).filter(Boolean);
    const users = await db.collection('users').find({ _id: { $in: userIds } }).toArray();
    const userMap = new Map(users.map(u => [u._id.toString(), u]));

    const records = allWaTx.map((t, idx) => {
      const show = t.showId ? showMap.get(t.showId.toString()) : null;
      const movie = t.movieId ? movieMap.get(t.movieId.toString()) : (show?.filmObjectId ? movieMap.get(show.filmObjectId.toString()) : (show?.movieId ? movieMap.get(show.movieId.toString()) : null));
      const cinema = t.cinemaId ? cinemaMap.get(t.cinemaId.toString()) : (show?.cinemaObjectId ? cinemaMap.get(show.cinemaObjectId.toString()) : null);
      const user = t.userId ? userMap.get(t.userId.toString()) : null;

      // Extract Seats
      let seatInfoStr = '';
      let seatCount = 0;
      if (t.commitBookingData?.strSeatInfo) {
        seatInfoStr = t.commitBookingData.strSeatInfo;
      } else if (t.setSeatData?.strSeatInfo) {
        seatInfoStr = t.setSeatData.strSeatInfo;
      } else if (t.addSeatData?.strSeatInfo) {
        seatInfoStr = t.addSeatData.strSeatInfo;
      } else if (t.finalBookingCalculation?.ticketCart?.selectedSeats?.length) {
        seatInfoStr = t.finalBookingCalculation.ticketCart.selectedSeats.map(s => `${s.strRowName || s.rowName || ''}${s.intSeatNumber || s.seatNumber || ''}`).join(', ');
        seatCount = t.finalBookingCalculation.ticketCart.selectedSeats.length;
      }

      if (seatInfoStr && !seatCount) {
        if (seatInfoStr.includes('-')) {
          seatCount = seatInfoStr.split('-')[1].split(',').filter(Boolean).length;
        } else {
          seatCount = seatInfoStr.split(',').filter(Boolean).length;
        }
      }

      // Customer Details
      const firstName = user?.firstName || '';
      const lastName = user?.lastName || '';
      const userNameFromUser = `${firstName} ${lastName}`.trim();
      const customerName = t.userName || t.userData?.name || t.name || userNameFromUser || t.paymentResponse?.notes?.name || 'N/A';
      const customerPhone = t.userPhone || t.userData?.phone || t.mobile || user?.mobileNumber?.toString() || user?.phone || t.paymentResponse?.contact || t.paymentResponse?.notes?.phone || 'N/A';
      const customerEmail = t.userEmail || t.userData?.email || t.email || user?.email || t.paymentResponse?.email || t.paymentResponse?.notes?.email || 'N/A';

      // Show details
      const showDateTime = show?.sessionRealShow || show?.sessionFilmFirstShow || t.showDate;
      const showScreen = show?.screenName || `Screen ${show?.screenNumber || ''}`.trim() || 'N/A';

      // Status
      let statusLabel = 'Initiated / Abandoned';
      if (t.status === 1) statusLabel = 'Confirmed';
      else if (t.status === 2) statusLabel = 'Payment Failed / Cancelled';
      else if (t.status === 4) statusLabel = 'Paid / Commit Failed';

      // Amounts
      const ticketTotal = t.commitBookingData?.curTicketsTotal ?? t.finalBookingCalculation?.ticketCart?.ticketTotal ?? 0;
      const fnbTotal = t.commitBookingData?.curFoodTotal ?? t.finalBookingCalculation?.foodCart?.fnbTotal ?? t.finalBookingCalculation?.fnbTotal ?? 0;
      const convFee = t.finalBookingCalculation?.convenienceFeesObject?.total ?? t.finalBookingCalculation?.convenienceFee ?? 0;
      const finalAmount = t.finalBookingCalculation?.finalAmount ?? (t.paymentResponse?.amount ? t.paymentResponse.amount / 100 : t.amount) ?? 0;

      return {
        srNo: idx + 1,
        transactionId: t._id.toString(),
        vistaBookingId: t.commitBookingData?.strBookId || t.commitBookingData?.strBookIdEx || t.bookingId || 'N/A',
        vistaTransId: t.commitBookingData?.strTransId || 'N/A',
        createdAtIST: toIST(t.createdAt),
        createdAtUTC: t.createdAt ? new Date(t.createdAt).toISOString() : 'N/A',
        status: statusLabel,
        statusCode: t.status,
        paymentsStatus: t.paymentsStatus ?? false,
        commitStatus: t.commitStatus ?? false,
        movieName: movie?.name || movie?.title || '3D NAMIT MALHOTRAS RAMAYANA (HINDI)',
        cinemaName: cinema?.name || cinema?.cinemaName || 'N/A',
        cinemaCity: cinema?.city || cinema?.address || 'N/A',
        screen: showScreen,
        showTimeIST: toIST(showDateTime),
        seatCount: seatCount || 0,
        seatInfo: seatInfoStr || 'N/A',
        ticketTotal: ticketTotal,
        fnbTotal: fnbTotal,
        convFee: convFee,
        finalAmount: finalAmount,
        customerName: customerName,
        customerPhone: customerPhone,
        customerEmail: customerEmail,
        paymentMethod: t.paymentResponse?.method || 'N/A',
        razorpayPaymentId: t.paymentResponse?.id || t.paymentId || 'N/A',
        razorpayOrderId: t.razorpayOrderId || t.paymentResponse?.order_id || t.orderId || 'N/A',
        utm_source: t.utm_source || 'N/A',
        utm_medium: t.utm_medium || 'N/A',
        utm_campaign: t.utm_campaign || 'N/A'
      };
    });

    fs.writeFileSync('scratch/ramayana_wa_full_records.json', JSON.stringify(records, null, 2), 'utf-8');
    console.log('Saved 26 complete records to scratch/ramayana_wa_full_records.json');

    // Generate CSV
    const csvHeader = [
      'Sr No', 'Transaction ID', 'Booking ID (Vista)', 'Status', 'Payments Status', 'Commit Status',
      'Created At (IST)', 'Movie Name', 'Cinema Name', 'Screen', 'Show Time (IST)',
      'Seat Count', 'Seat Info', 'Ticket Total (₹)', 'F&B Total (₹)', 'Conv Fee (₹)', 'Final Amount (₹)',
      'Customer Name', 'Customer Phone', 'Customer Email', 'Payment Method', 'Razorpay Payment ID', 'Razorpay Order ID',
      'UTM Source', 'UTM Campaign'
    ];

    const csvRows = records.map(r => [
      r.srNo,
      `"${r.transactionId}"`,
      `"${r.vistaBookingId}"`,
      `"${r.status}"`,
      r.paymentsStatus,
      r.commitStatus,
      `"${r.createdAtIST}"`,
      `"${r.movieName}"`,
      `"${r.cinemaName}"`,
      `"${r.screen}"`,
      `"${r.showTimeIST}"`,
      r.seatCount,
      `"${r.seatInfo}"`,
      r.ticketTotal,
      r.fnbTotal,
      r.convFee,
      r.finalAmount,
      `"${r.customerName}"`,
      `"${r.customerPhone}"`,
      `"${r.customerEmail}"`,
      `"${r.paymentMethod}"`,
      `"${r.razorpayPaymentId}"`,
      `"${r.razorpayOrderId}"`,
      `"${r.utm_source}"`,
      `"${r.utm_campaign}"`
    ].join(','));

    fs.writeFileSync('scratch/ramayana_wa_report.csv', [csvHeader.join(','), ...csvRows].join('\n'), 'utf-8');
    console.log('Saved CSV report to scratch/ramayana_wa_report.csv');

    // Confirmed bookings summary
    const confirmed = records.filter(r => r.statusCode === 1);
    console.log('\n================ CONFIRMED BOOKINGS (STATUS 1) ================');
    console.log(`Count: ${confirmed.length}`);
    for (const c of confirmed) {
      console.log(`\n• Transaction: ${c.transactionId} | Vista Booking: ${c.vistaBookingId}`);
      console.log(`  Date: ${c.createdAtIST} | Cinema: ${c.cinemaName} | Screen: ${c.screen}`);
      console.log(`  Show Time: ${c.showTimeIST} | Seats (${c.seatCount}): ${c.seatInfo}`);
      console.log(`  Total: ₹${c.finalAmount} (Ticket: ₹${c.ticketTotal}, F&B: ₹${c.fnbTotal}, Fee: ₹${c.convFee})`);
      console.log(`  Customer: Phone: ${c.customerPhone}, Method: ${c.paymentMethod}, Razorpay: ${c.razorpayPaymentId}`);
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

run();
