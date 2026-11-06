import mongoose from 'mongoose';

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

    console.log('Matching movies count:', movies.length);
    for (const m of movies) {
      console.log(`Movie ID: ${m._id}, Name: ${m.name || m.title || m.movieName}, code: ${m.code || m.vistaMovieId}`);
    }

    const movieIds = movies.map(m => m._id);

    // Also check shows collection
    const shows = await db.collection('shows').find({
      $or: [
        { movieId: { $in: movieIds } },
        { 'movieData.name': { $regex: /ramayan/i } },
        { movieName: { $regex: /ramayan/i } }
      ]
    }).toArray();
    console.log('Matching shows count:', shows.length);
    const showIds = shows.map(s => s._id);

    // 2. Query transactions
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
    console.log('Matching transactions count:', txs.length);

    // Let's also check if there are ANY transactions for ramayana, regardless of utm_source
    const allRamayanaTxCount = await db.collection('transactions').countDocuments({
      $or: [
        { movieId: { $in: movieIds } },
        { showId: { $in: showIds } },
        { 'movieData.name': { $regex: /ramayan/i } },
        { 'movieData.title': { $regex: /ramayan/i } },
        { movieName: { $regex: /ramayan/i } }
      ]
    });
    console.log('All Ramayana transactions count (any utm_source):', allRamayanaTxCount);

    // Distinct utm_sources for ramayana
    const distinctSourcesRamayana = await db.collection('transactions').distinct('utm_source', {
      $or: [
        { movieId: { $in: movieIds } },
        { showId: { $in: showIds } },
        { 'movieData.name': { $regex: /ramayan/i } },
        { 'movieData.title': { $regex: /ramayan/i } },
        { movieName: { $regex: /ramayan/i } }
      ]
    });
    console.log('Distinct utm_source for Ramayana:', distinctSourcesRamayana);

    // If transactions found, let's print summary
    if (txs.length > 0) {
      console.log('\n--- Transactions Details ---');
      txs.forEach((t, i) => {
        console.log(`\n#${i + 1}:`);
        console.log({
          _id: t._id,
          bookingId: t.bookingId || t.userBookingId,
          createdAt: t.createdAt,
          status: t.status,
          paymentsStatus: t.paymentsStatus,
          commitStatus: t.commitStatus,
          orderId: t.orderId,
          cinemaId: t.cinemaId,
          cinemaName: t.cinemaData?.name,
          movieName: t.movieData?.name || t.movieName,
          showDate: t.showDate || t.showData?.showDate,
          showTime: t.showTime || t.showData?.showTime,
          userPhone: t.userPhone || t.userData?.phone || t.mobile,
          userEmail: t.userEmail || t.userData?.email || t.email,
          userName: t.userName || t.userData?.name || t.name,
          ticketCount: t.finalBookingCalculation?.ticketCart?.selectedSeats?.length || t.seats?.length,
          seats: t.finalBookingCalculation?.ticketCart?.selectedSeats?.map(s => s.seatNumber || s.strSeatNumber) || t.seats,
          ticketTotal: t.finalBookingCalculation?.ticketCart?.ticketTotal,
          finalAmount: t.finalBookingCalculation?.finalAmount || (t.paymentResponse?.amount ? t.paymentResponse.amount / 100 : t.amount),
          utm_source: t.utm_source,
          utm_medium: t.utm_medium,
          utm_campaign: t.utm_campaign
        });
      });
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

run();
