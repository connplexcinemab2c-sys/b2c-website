import mongoose from 'mongoose';

async function run() {
  try {
    await mongoose.connect('mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin');
    const db = mongoose.connection.db;

    // 1. Check whatsapp orders collection
    const waOrdersCount = await db.collection('whatsapporders').countDocuments();
    console.log(`WhatsApp Orders count in whatsapporders: ${waOrdersCount}`);
    if (waOrdersCount > 0) {
      const sample = await db.collection('whatsapporders').find().limit(3).toArray();
      console.log("Sample WhatsAppOrder:", sample);
    }

    // 2. Fetch all movies to build an accurate ID -> Name map
    const movies = await db.collection('movies').find().toArray();
    const movieMap = new Map();
    for (const m of movies) {
      movieMap.set(m._id.toString(), m.name || m.title || m.movieName);
    }

    // 3. Fetch shows if needed
    const shows = await db.collection('shows').find().toArray();
    const showMap = new Map();
    for (const s of shows) {
      showMap.set(s._id.toString(), s);
    }

    // 4. Query all transactions where utm_source regex /whatsapp/i
    const waTransactions = await db.collection('transactions').find({
      utm_source: { $regex: /whatsapp/i }
    }).sort({ createdAt: 1 }).toArray();

    console.log(`Total transactions with utm_source=whatsapp: ${waTransactions.length}`);

    // Let's inspect each transaction that has status 1 or paymentsStatus: true
    const bookedTx = waTransactions.filter(t => t.status === 1 || (t.paymentsStatus === true && t.commitStatus === true));
    console.log(`Total Confirmed Bookings (Status 1): ${bookedTx.length}`);

    // Check status 4 (paymentsStatus true, commitStatus false)
    const status4Tx = waTransactions.filter(t => t.status === 4 || (t.paymentsStatus === true && t.commitStatus !== true));
    console.log(`Total Paid but Commit Failed (Status 4): ${status4Tx.length}`);

    // Analyze ticket count and revenue calculation methods on confirmed bookings
    let missingMovieCount = 0;
    let missingTicketCount = 0;
    let missingAmountCount = 0;

    for (const t of bookedTx) {
      let movieName = movieMap.get(t.movieId?.toString()) || t.movieData?.name || t.movieData?.title;
      if (!movieName && t.showId) {
        const show = showMap.get(t.showId.toString());
        if (show) {
          movieName = movieMap.get(show.movieId?.toString()) || show.movieData?.name || show.movieName;
        }
      }
      if (!movieName) {
        missingMovieCount++;
        // console.log("Missing movie for tx:", t._id, "showId:", t.showId, "movieId:", t.movieId);
      }

      // Check ticket count
      let ticketCount = t.finalBookingCalculation?.ticketCart?.selectedSeats?.length || 0;
      if (!ticketCount) {
        const seatInfo = t.commitBookingData?.strSeatInfo || t.addSeatData?.strSeatInfo || t.setSeatData?.strSeatInfo;
        if (seatInfo && seatInfo.includes('-')) {
          ticketCount = seatInfo.split('-')[1].split(',').filter(Boolean).length;
        } else if (seatInfo) {
          ticketCount = seatInfo.split(',').filter(Boolean).length;
        }
      }
      if (!ticketCount) missingTicketCount++;

      // Check amount
      const ticketTotal = t.finalBookingCalculation?.ticketCart?.ticketTotal;
      const finalAmount = t.finalBookingCalculation?.finalAmount;
      const payAmount = t.paymentResponse?.amount ? (t.paymentResponse.amount / 100) : null;
      if (ticketTotal === undefined && finalAmount === undefined && payAmount === null) {
        missingAmountCount++;
      }
    }

    console.log({
      missingMovieCount,
      missingTicketCount,
      missingAmountCount
    });

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

run();
