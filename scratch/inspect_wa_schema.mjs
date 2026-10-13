import mongoose from 'mongoose';

async function run() {
  try {
    await mongoose.connect('mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin');
    const db = mongoose.connection.db;

    // Check distinct status values for whatsapp transactions
    const statuses = await db.collection('transactions').aggregate([
      { $match: { utm_source: { $regex: /whatsapp/i } } },
      { $group: { _id: { status: "$status", paymentsStatus: "$paymentsStatus", commitStatus: "$commitStatus" }, count: { $sum: 1 } } }
    ]).toArray();

    console.log("Status breakdown for WhatsApp transactions:");
    console.log(statuses);

    // Look at a sample status: 1 transaction to understand all relevant fields
    const sampleBooked = await db.collection('transactions').findOne({
      utm_source: { $regex: /whatsapp/i },
      status: 1
    });

    console.log("\nSample booked transaction fields:");
    console.log({
      _id: sampleBooked._id,
      createdAt: sampleBooked.createdAt,
      status: sampleBooked.status,
      paymentsStatus: sampleBooked.paymentsStatus,
      commitStatus: sampleBooked.commitStatus,
      movieId: sampleBooked.movieId,
      movieData: sampleBooked.movieData,
      cinemaId: sampleBooked.cinemaId,
      cinemaData: sampleBooked.cinemaData,
      showId: sampleBooked.showId,
      showData: sampleBooked.showData,
      finalBookingCalculation: sampleBooked.finalBookingCalculation,
      addSeatData: sampleBooked.addSeatData,
      commitBookingData: sampleBooked.commitBookingData,
      paymentResponse: sampleBooked.paymentResponse,
      razorpayPaymentId: sampleBooked.razorpayPaymentId
    });

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

run();
