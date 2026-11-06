import mongoose from 'mongoose';
import fs from 'fs';

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
        { 'movieData.name': { $regex: /ramayan/i } },
        { movieName: { $regex: /ramayan/i } }
      ]
    }).toArray();
    const showIds = shows.map(s => s._id);
    const showMap = new Map(shows.map(s => [s._id.toString(), s]));

    // Cinemas
    const cinemas = await db.collection('cinemas').find().toArray();
    const cinemaMap = new Map(cinemas.map(c => [c._id.toString(), c]));

    const txs = await db.collection('transactions').find({
      $and: [
        { utm_source: { $regex: /whatsapp/i } },
        {
          $or: [
            { movieId: { $in: movieIds } },
            { showId: { $in: showIds } },
            { 'movieData.name': { $regex: /ramayan/i } },
            { movieName: { $regex: /ramayan/i } }
          ]
        }
      ]
    }).sort({ createdAt: -1 }).toArray();

    // Users
    const userIds = txs.map(t => t.userId).filter(Boolean);
    const users = await db.collection('users').find({ _id: { $in: userIds } }).toArray();
    const userMap = new Map(users.map(u => [u._id.toString(), u]));

    const parsed = txs.map((t, idx) => {
      const show = t.showId ? showMap.get(t.showId.toString()) : null;
      const movie = t.movieId ? movieMap.get(t.movieId.toString()) : (show?.movieId ? movieMap.get(show.movieId.toString()) : null);
      const cinema = t.cinemaId ? cinemaMap.get(t.cinemaId.toString()) : (show?.cinemaId ? cinemaMap.get(show.cinemaId.toString()) : null);
      const user = t.userId ? userMap.get(t.userId.toString()) : null;

      // Seats & ticket count
      let seats = [];
      let seatCount = 0;
      if (t.finalBookingCalculation?.ticketCart?.selectedSeats && t.finalBookingCalculation.ticketCart.selectedSeats.length > 0) {
        seats = t.finalBookingCalculation.ticketCart.selectedSeats.map(s => s.seatNumber || s.strSeatNumber || `${s.strRowName || s.rowName || ''}${s.intSeatNumber || s.seatNumber || ''}`);
        seatCount = seats.length;
      } else {
        const rawSeatStr = t.commitBookingData?.strSeatInfo || t.addSeatData?.strSeatInfo || t.setSeatData?.strSeatInfo || t.strSeatInfo;
        if (rawSeatStr) {
          seats = [rawSeatStr];
          if (rawSeatStr.includes('-')) {
            seatCount = rawSeatStr.split('-')[1].split(',').filter(Boolean).length;
          } else {
            seatCount = rawSeatStr.split(',').filter(Boolean).length;
          }
        }
      }

      // Customer Info
      const name = t.userName || t.userData?.name || t.name || user?.name || t.paymentResponse?.notes?.name || t.paymentResponse?.notes?.userName;
      const phone = t.userPhone || t.userData?.phone || t.userData?.mobile || t.mobile || user?.phone || user?.mobile || t.paymentResponse?.contact || t.paymentResponse?.notes?.phone;
      const email = t.userEmail || t.userData?.email || t.email || user?.email || t.paymentResponse?.email || t.paymentResponse?.notes?.email;

      return {
        index: idx + 1,
        id: t._id.toString(),
        bookingId: t.bookingId || t.userBookingId || t.commitBookingResponse?.bookingId || t.bookingNumber || null,
        vistaBookingNumber: t.vistaBookingNumber || t.commitBookingResponse?.bookingNumber || null,
        createdAt: t.createdAt,
        status: t.status,
        statusText: t.status === 1 ? 'Confirmed' : (t.status === 2 ? 'Failed / Cancelled' : (t.status === 4 ? 'Paid / Commit Error' : 'Initiated / Abandoned')),
        paymentsStatus: t.paymentsStatus,
        commitStatus: t.commitStatus,
        movieName: movie?.name || movie?.title || show?.movieData?.name || t.movieData?.name || 'Ramayana',
        cinemaName: cinema?.name || cinema?.cinemaName || t.cinemaData?.name || null,
        cinemaCity: cinema?.city || cinema?.address || null,
        showDate: t.showDate || show?.showDate || show?.date || null,
        showTime: t.showTime || show?.showTime || show?.time || null,
        customerName: name || null,
        customerPhone: phone || null,
        customerEmail: email || null,
        seatCount: seatCount,
        seats: seats,
        ticketTotal: t.finalBookingCalculation?.ticketCart?.ticketTotal || null,
        fnbTotal: t.finalBookingCalculation?.fnbTotal || null,
        convenienceFee: t.finalBookingCalculation?.convenienceFee || null,
        finalAmount: t.finalBookingCalculation?.finalAmount || (t.paymentResponse?.amount ? t.paymentResponse.amount / 100 : t.amount) || null,
        paymentMethod: t.paymentResponse?.method || null,
        razorpayPaymentId: t.paymentId || t.paymentResponse?.id || t.razorpayPaymentId || null,
        razorpayOrderId: t.orderId || t.paymentResponse?.order_id || t.razorpayOrderId || null,
        utm_source: t.utm_source,
        utm_medium: t.utm_medium,
        utm_campaign: t.utm_campaign,
        utm_term: t.utm_term
      };
    });

    fs.writeFileSync('scratch/tx_dump.json', JSON.stringify(parsed, null, 2), 'utf-8');
    console.log('Successfully wrote', parsed.length, 'records to scratch/tx_dump.json');

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

run();
