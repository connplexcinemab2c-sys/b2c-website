import mongoose from 'mongoose';
import fs from 'fs';

async function run() {
  try {
    await mongoose.connect('mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin');
    const db = mongoose.connection.db;

    // 1. Find all movies with Ramayana or similar
    const movies = await db.collection('movies').find({
      $or: [
        { name: { $regex: /ramayan/i } },
        { title: { $regex: /ramayan/i } },
        { movieName: { $regex: /ramayan/i } }
      ]
    }).toArray();

    const movieMap = new Map();
    for (const m of movies) {
      movieMap.set(m._id.toString(), m);
    }
    const movieIds = movies.map(m => m._id);

    // Shows
    const shows = await db.collection('shows').find({
      $or: [
        { movieId: { $in: movieIds } },
        { 'movieData.name': { $regex: /ramayan/i } },
        { movieName: { $regex: /ramayan/i } }
      ]
    }).toArray();
    const showMap = new Map();
    for (const s of shows) {
      showMap.set(s._id.toString(), s);
    }
    const showIds = shows.map(s => s._id);

    // Cinemas
    const cinemas = await db.collection('cinemas').find().toArray();
    const cinemaMap = new Map();
    for (const c of cinemas) {
      cinemaMap.set(c._id.toString(), c);
    }

    // Query transactions
    const query = {
      $and: [
        { utm_source: { $regex: /whatsapp/i } },
        {
          $or: [
            { movieId: { $in: movieIds } },
            { showId: { $in: showIds } },
            { 'movieData.name': { $regex: /ramayan/i } },
            { 'movieData.title': { $regex: /ramayan/i } },
            { movieName: { $regex: /ramayan/i } }
          ]
        }
      ]
    };

    const txs = await db.collection('transactions').find(query).sort({ createdAt: -1 }).toArray();

    // Also fetch users if userId exists
    const userIds = txs.map(t => t.userId).filter(Boolean);
    const users = await db.collection('users').find({ _id: { $in: userIds } }).toArray();
    const userMap = new Map();
    for (const u of users) {
      userMap.set(u._id.toString(), u);
    }

    console.log(`Found ${txs.length} transactions for Ramayana with utm_source=whatsapp.`);

    const detailedList = txs.map((t, idx) => {
      const show = t.showId ? showMap.get(t.showId.toString()) : null;
      const movie = t.movieId ? movieMap.get(t.movieId.toString()) : (show?.movieId ? movieMap.get(show.movieId.toString()) : null);
      const cinema = t.cinemaId ? cinemaMap.get(t.cinemaId.toString()) : (show?.cinemaId ? cinemaMap.get(show.cinemaId.toString()) : null);
      const user = t.userId ? userMap.get(t.userId.toString()) : null;

      // Extract seats
      let seats = [];
      if (t.finalBookingCalculation?.ticketCart?.selectedSeats) {
        seats = t.finalBookingCalculation.ticketCart.selectedSeats.map(s => s.seatNumber || s.strSeatNumber || `${s.strRowName || s.rowName}${s.intSeatNumber || s.seatNumber}`);
      } else if (t.commitBookingData?.strSeatInfo) {
        seats = [t.commitBookingData.strSeatInfo];
      } else if (t.addSeatData?.strSeatInfo) {
        seats = [t.addSeatData.strSeatInfo];
      } else if (t.setSeatData?.strSeatInfo) {
        seats = [t.setSeatData.strSeatInfo];
      }

      // Customer info
      const customerName = t.userName || t.userData?.name || t.name || user?.name || t.paymentResponse?.notes?.name || t.paymentResponse?.email;
      const customerMobile = t.userPhone || t.userData?.phone || t.userData?.mobile || t.mobile || user?.phone || user?.mobile || t.paymentResponse?.contact;
      const customerEmail = t.userEmail || t.userData?.email || t.email || user?.email || t.paymentResponse?.email;

      // Amounts
      const ticketTotal = t.finalBookingCalculation?.ticketCart?.ticketTotal || 0;
      const fnbTotal = t.finalBookingCalculation?.fnbTotal || 0;
      const convenienceFee = t.finalBookingCalculation?.convenienceFee || 0;
      const finalAmount = t.finalBookingCalculation?.finalAmount || (t.paymentResponse?.amount ? t.paymentResponse.amount / 100 : t.amount);

      // Status description
      let statusDesc = 'Unknown';
      if (t.status === 1) statusDesc = 'SUCCESS / CONFIRMED';
      else if (t.status === 0) statusDesc = 'INITIATED / INCOMPLETE (No payment)';
      else if (t.status === 2) statusDesc = 'PAYMENT FAILED / CANCELLED';
      else if (t.status === 4) statusDesc = 'PAID BUT COMMIT FAILED';

      return {
        index: idx + 1,
        transactionId: t._id.toString(),
        bookingId: t.bookingId || t.userBookingId || t.vistaBookingId || t.bookingNumber || t.commitBookingResponse?.bookingId,
        orderId: t.orderId || t.paymentResponse?.order_id || t.razorpayOrderId,
        paymentId: t.paymentId || t.paymentResponse?.id || t.razorpayPaymentId,
        createdAt: t.createdAt,
        status: t.status,
        statusDesc,
        paymentsStatus: t.paymentsStatus,
        commitStatus: t.commitStatus,
        movieName: movie?.name || movie?.title || show?.movieData?.name || t.movieData?.name || 'Ramayana',
        cinemaName: cinema?.name || cinema?.cinemaName || t.cinemaData?.name,
        cinemaLocation: cinema?.city || cinema?.location || cinema?.address,
        showDate: t.showDate || show?.showDate || show?.date,
        showTime: t.showTime || show?.showTime || show?.time,
        seatCount: seats.length,
        seats: seats.join(', '),
        ticketTotal,
        fnbTotal,
        convenienceFee,
        finalAmount,
        customerName,
        customerMobile,
        customerEmail,
        utm_source: t.utm_source,
        utm_medium: t.utm_medium,
        utm_campaign: t.utm_campaign,
        utm_term: t.utm_term,
        rawKeys: Object.keys(t)
      };
    });

    fs.writeFileSync('scratch/ramayana_wa_transactions.json', JSON.stringify(detailedList, null, 2));
    console.log('Saved to scratch/ramayana_wa_transactions.json');

    // Summary breakdown
    const breakdown = {
      total: detailedList.length,
      byStatus: {},
      byMovie: {},
      byCinema: {},
      totalRevenueConfirmed: 0,
      totalTicketsConfirmed: 0
    };

    for (const item of detailedList) {
      breakdown.byStatus[item.statusDesc] = (breakdown.byStatus[item.statusDesc] || 0) + 1;
      breakdown.byMovie[item.movieName] = (breakdown.byMovie[item.movieName] || 0) + 1;
      breakdown.byCinema[item.cinemaName] = (breakdown.byCinema[item.cinemaName] || 0) + 1;
      if (item.status === 1) {
        breakdown.totalRevenueConfirmed += (item.finalAmount || 0);
        breakdown.totalTicketsConfirmed += (item.seatCount || 0);
      }
    }

    console.log('--- SUMMARY BREAKDOWN ---');
    console.log(JSON.stringify(breakdown, null, 2));

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

run();
