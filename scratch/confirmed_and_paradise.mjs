import mongoose from 'mongoose';

async function run() {
  try {
    await mongoose.connect('mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin');
    const db = mongoose.connection.db;

    const confirmedIds = [
      new mongoose.Types.ObjectId('6ab5fa5a364a058e26d378a0'),
      new mongoose.Types.ObjectId('6ab683171b1734c6bcad4cc7'),
      new mongoose.Types.ObjectId('6ab8eecbfe2ca3e6f825232f')
    ];

    const cinemas = await db.collection('cinemas').find({}).toArray();
    const cinemaMap = new Map();
    for (const c of cinemas) cinemaMap.set(c._id.toString(), c);

    const movies = await db.collection('movies').find({}).toArray();
    const movieMap = new Map();
    for (const m of movies) movieMap.set(m._id.toString(), m);

    console.log("=== CONFIRMED BOOKINGS DETAILS ===");
    for (const id of confirmedIds) {
      const tx = await db.collection('transactions').findOne({ _id: id });
      const cinema = cinemaMap.get(tx.cinemaId?.toString());
      const movie = movieMap.get(tx.movieId?.toString());
      const show = tx.showId ? await db.collection('shows').findOne({ _id: tx.showId }) : null;

      // Extract Vista booking details
      const bookData = tx.commitBookingData || tx.addSeatData;
      const vistaBookingId = bookData?.strBookId || bookData?.strBookIdEx || bookData?.intBookId;
      const seatInfo = bookData?.strSeatInfo;

      // If showData is missing, check session in paymentResponse notes
      const sessionId = tx.paymentResponse?.notes?.sessionId;
      let sessionDoc = null;
      if (sessionId) {
        sessionDoc = await db.collection('shows').findOne({
          $or: [
            { sessionId: sessionId },
            { lngSessionId: Number(sessionId) },
            { "shows.sessionId": sessionId },
            { "shows.lngSessionId": Number(sessionId) }
          ]
        });
      }

      console.log({
        txId: tx._id.toString(),
        initTransId: tx.initTransId,
        createdAtIST: new Date(new Date(tx.createdAt).getTime() + 5.5 * 3600 * 1000).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
        movie: movie?.name || tx.movieData?.name,
        cinema: cinema?.name || cinema?.cinemaName,
        cinemaCity: cinema?.city,
        showId: tx.showId,
        sessionId: sessionId,
        showData: tx.showData,
        showDoc: show ? { screenName: show.screenName, showDate: show.showDate, showTime: show.showTime } : null,
        sessionDoc: sessionDoc ? { screenName: sessionDoc.screenName, showDate: sessionDoc.showDate, showTime: sessionDoc.showTime } : null,
        seats: seatInfo,
        bookingRef: vistaBookingId,
        ticketTotal: tx.finalBookingCalculation?.ticketCart?.ticketTotal,
        totalPayable: tx.finalBookingCalculation?.finalAmount || tx.paymentResponse?.amount,
        phone: tx.normalized_phone || tx.paymentResponse?.contact,
        email: tx.paymentResponse?.email,
        paymentId: tx.razorpayPaymentId || tx.paymentResponse?.razorpay_payment_id,
        orderId: tx.razorpayOrderId || tx.paymentResponse?.razorpay_order_id,
        paymentMethod: tx.paymentResponse?.method,
        vpa: tx.paymentResponse?.vpa,
        status: "CONFIRMED (Booked)",
        utm_source: tx.utm_source
      });
    }

    // Now let's list all 10 Paradise transactions with utm_source = whatsapp over the weekend
    const startUtc = new Date("2026-09-24T18:30:00.000Z");
    const endUtc = new Date("2026-09-28T18:29:59.999Z");

    const paradiseMovies = movies.filter(m => /paradise/i.test(m.name || m.title)).map(m => m._id);
    const paradiseTx = await db.collection('transactions').find({
      utm_source: { $regex: /whatsapp/i },
      $or: [
        { movieId: { $in: paradiseMovies } },
        { "movieData.name": /paradise/i }
      ],
      createdAt: { $gte: startUtc, $lte: endUtc }
    }).sort({ createdAt: 1 }).toArray();

    console.log("\n=== ALL PARADISE WHATSAPP TRANSACTIONS OVER THE WEEKEND ===");
    for (const tx of paradiseTx) {
      const cinema = cinemaMap.get(tx.cinemaId?.toString());
      const movie = movieMap.get(tx.movieId?.toString());
      const seatInfo = tx.commitBookingData?.strSeatInfo || tx.addSeatData?.strSeatInfo || "-";
      console.log({
        txId: tx._id.toString(),
        initTransId: tx.initTransId,
        timeIST: new Date(new Date(tx.createdAt).getTime() + 5.5 * 3600 * 1000).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
        movie: movie?.name,
        cinema: cinema?.name || cinema?.cinemaName,
        seats: seatInfo,
        amount: tx.finalBookingCalculation?.ticketCart?.ticketTotal || tx.finalBookingCalculation?.totalPayableAmount,
        status: tx.status === 1 ? "Booked" : tx.status === 5 ? "Payment Failed" : "Initiated/Abandoned (Status 0)",
        phone: tx.normalized_phone || tx.paymentResponse?.contact || "-",
        razorpayPaymentId: tx.razorpayPaymentId || tx.paymentResponse?.razorpay_payment_id || "-"
      });
    }

    await mongoose.disconnect();
  } catch (e) {
    console.error(e);
  }
}

run();
