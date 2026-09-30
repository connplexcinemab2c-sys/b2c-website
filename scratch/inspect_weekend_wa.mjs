import mongoose from 'mongoose';

async function run() {
  try {
    await mongoose.connect('mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin');
    const db = mongoose.connection.db;

    // Find all movie IDs for Paradise and Vvaan
    const movies = await db.collection('movies').find({
      $or: [
        { name: /paradise/i },
        { title: /paradise/i },
        { name: /vvaan/i },
        { title: /vvaan/i }
      ]
    }).toArray();

    const movieMap = new Map();
    const movieIds = [];
    for (const m of movies) {
      movieIds.push(m._id);
      movieMap.set(m._id.toString(), m.name || m.title);
    }
    console.log(`Found ${movieIds.length} movie entries for Paradise & Vvaan.`);

    // Cinema map
    const cinemas = await db.collection('cinemas').find({}).toArray();
    const cinemaMap = new Map();
    for (const c of cinemas) {
      cinemaMap.set(c._id.toString(), c.name || c.cinemaName);
    }

    // Define weekend range:
    // Friday Sept 25 00:00:00 IST to Sunday Sept 27 23:59:59 IST (or Monday Sept 28 morning)
    // In UTC: IST is UTC+5:30.
    // 2026-09-25T00:00:00+05:30 = 2026-09-24T18:30:00.000Z
    // 2026-09-27T23:59:59+05:30 = 2026-09-27T18:29:59.999Z
    // 2026-09-28T23:59:59+05:30 = 2026-09-28T18:29:59.999Z
    
    // Let's query all transactions for these movies where utm_source is whatsapp
    const allWaTx = await db.collection('transactions').find({
      utm_source: { $regex: /whatsapp/i },
      $or: [
        { movieId: { $in: movieIds } },
        { "movieData.name": /paradise|vvaan/i }
      ]
    }).sort({ createdAt: 1 }).toArray();

    console.log(`Total WhatsApp tx for Paradise & Vvaan (all time): ${allWaTx.length}`);

    // Print summary by date
    const dateCounts = {};
    for (const tx of allWaTx) {
      const dateKey = new Date(new Date(tx.createdAt).getTime() + 5.5 * 3600 * 1000).toISOString().split('T')[0];
      dateCounts[dateKey] = (dateCounts[dateKey] || 0) + 1;
    }
    console.log("Date distribution (IST):", dateCounts);

    // Let's also check status breakdown
    const statusCounts = {};
    for (const tx of allWaTx) {
      statusCounts[tx.status] = (statusCounts[tx.status] || 0) + 1;
    }
    console.log("Status distribution:", statusCounts);

    // Let's specifically inspect transactions from Sept 25 to Sept 28
    const weekendTx = allWaTx.filter(tx => {
      const istDate = new Date(new Date(tx.createdAt).getTime() + 5.5 * 3600 * 1000).toISOString().split('T')[0];
      return istDate >= '2026-09-25' && istDate <= '2026-09-28';
    });

    console.log(`\n=== WEEKEND (Sept 25 to Sept 28) WhatsApp Tx for Paradise & Vvaan: ${weekendTx.length} ===\n`);

    for (const tx of weekendTx) {
      const istDate = new Date(new Date(tx.createdAt).getTime() + 5.5 * 3600 * 1000).toISOString().replace('Z', '+05:30');
      const movieName = movieMap.get(tx.movieId?.toString()) || tx.movieData?.name;
      const cinemaName = cinemaMap.get(tx.cinemaId?.toString()) || tx.cinemaData?.name || tx.cinemaData?.cinemaName;
      
      console.log("--------------------------------------------------");
      console.log(`TxID: ${tx._id} | InitTransId: ${tx.initTransId}`);
      console.log(`Time (IST): ${istDate}`);
      console.log(`Status: ${tx.status} (paymentsStatus: ${tx.paymentsStatus}, commitStatus: ${tx.commitStatus})`);
      console.log(`Movie: ${movieName} (ID: ${tx.movieId})`);
      console.log(`Cinema: ${cinemaName} (ID: ${tx.cinemaId})`);
      console.log(`Show Date/Time: ${tx.showData?.showDate || tx.showData?.sessionRealShow || tx.showData?.showTime}`);
      console.log(`Seats: ${JSON.stringify(tx.addSeatData?.strSeatInfo || tx.commitBookingData?.strSeatInfo || tx.setSeatData)}`);
      console.log(`Ticket Cart: ${JSON.stringify(tx.finalBookingCalculation?.ticketCart)}`);
      console.log(`Total Payable / Amount: ${tx.finalBookingCalculation?.totalPayableAmount || tx.finalBookingCalculation?.ticketCart?.ticketTotal || tx.paymentResponse?.amount}`);
      console.log(`User/Contact: Phone: ${tx.normalized_phone || tx.paymentResponse?.contact}, Email: ${tx.paymentResponse?.email}`);
      console.log(`Razorpay Payment ID: ${tx.razorpayPaymentId || tx.paymentResponse?.razorpay_payment_id}`);
      console.log(`UTM: source=${tx.utm_source}, campaign=${tx.utm_campaign}`);
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error("Error:", err);
  }
}

run();
