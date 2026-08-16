import mongoose from "mongoose";
import fs from "fs";

const MONGO_URL = "mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin";

async function run() {
  try {
    await mongoose.connect(MONGO_URL);
    console.log("DB connected successfully.");

    const db = mongoose.connection.db;

    // 1. Find the movies
    const movies = await db.collection("movies").find({
      name: { $regex: /odyssey|odessey/i }
    }).toArray();

    const movieIds = movies.map(m => m._id);
    const moviesMap = {};
    movies.forEach(m => {
      moviesMap[m._id.toString()] = m;
    });

    // 2. Query successful transactions referencing these movies and booked via web
    console.log("Fetching web transactions...");
    const transactions = await db.collection("transactions").find({
      movieId: { $in: movieIds },
      status: 1,
      $or: [
        { bookedFrom: { $regex: /^web$/i } },
        { booking_type: { $regex: /^web$/i } }
      ]
    }).toArray();

    console.log(`Found ${transactions.length} successful web bookings.`);

    // Fetch all cinemas
    const cinemas = await db.collection("cinemas").find({}).toArray();
    const cinemasMap = {};
    cinemas.forEach(c => {
      cinemasMap[c._id.toString()] = c;
    });

    // Fetch all users
    const userIds = [...new Set(transactions.map(t => t.userId).filter(Boolean))];
    const users = await db.collection("users").find({ _id: { $in: userIds } }).toArray();
    const usersMap = {};
    users.forEach(u => {
      usersMap[u._id.toString()] = u;
    });

    const webBookings = [];

    for (const tx of transactions) {
      const movie = moviesMap[tx.movieId.toString()];
      const cinema = tx.cinemaId ? cinemasMap[tx.cinemaId.toString()] : null;
      const user = tx.userId ? usersMap[tx.userId.toString()] : null;

      // Decode seats
      let seatNames = [];
      let numSeats = 1;
      let rawSeatInfo = "";
      
      if (tx.commitBookingData && tx.commitBookingData.strSeatInfo) {
        rawSeatInfo = tx.commitBookingData.strSeatInfo;
      } else if (tx.setSeatData && tx.setSeatData.strSeatInfo) {
        rawSeatInfo = tx.setSeatData.strSeatInfo;
      }

      if (rawSeatInfo) {
        const parts = rawSeatInfo.split("-");
        const seatPart = parts[parts.length - 1].trim();
        if (seatPart) {
          seatNames = seatPart.split(",").map(s => s.trim()).filter(Boolean);
          numSeats = seatNames.length;
        }
      } else {
        let seatsArray = [];
        if (tx.addSeatData && tx.addSeatData.seats) {
          seatsArray = tx.addSeatData.seats;
        } else if (tx.setSeatData && tx.setSeatData.seats) {
          seatsArray = tx.setSeatData.seats;
        }

        if (seatsArray && seatsArray.length > 0) {
          seatNames = seatsArray.map(s => (s.rowId || "") + (s.seatNumber || ""));
          numSeats = seatNames.length;
        } else {
          numSeats = tx.quantity || 1;
        }
      }

      // Check payment amount
      let paid = 0;
      if (tx.finalBookingCalculation && tx.finalBookingCalculation.finalAmount) {
        paid = Number(tx.finalBookingCalculation.finalAmount);
      } else if (tx.finalBookingCalculation && tx.finalBookingCalculation.totalPaidAmount) {
        paid = Number(tx.finalBookingCalculation.totalPaidAmount);
      } else if (tx.paymentDetail && tx.paymentDetail.amount) {
        paid = Number(tx.paymentDetail.amount);
      } else if (tx.paymentsBreakup && tx.paymentsBreakup.totalAmount) {
        paid = Number(tx.paymentsBreakup.totalAmount);
      } else if (tx.paymentResponse && tx.paymentResponse.amount) {
        paid = Number(tx.paymentResponse.amount) / 100;
      }

      // Check for show details if available (optional)
      const showDate = tx.createdAt; // Booking date/time

      webBookings.push({
        transactionId: tx._id.toString(),
        movieName: movie ? movie.name : "Unknown Movie",
        cinemaName: cinema ? cinema.cinemaName : "Unknown Cinema",
        userName: user ? user.name : "N/A",
        userPhone: user ? user.mobileNumber : (tx.paymentResponse?.contact || "N/A"),
        userEmail: user ? user.email : (tx.paymentResponse?.email || "N/A"),
        bookingDate: showDate,
        ticketsCount: numSeats,
        seats: seatNames.join(", "),
        amountPaid: paid,
        bookingSource: tx.bookedFrom || tx.booking_type || "web"
      });
    }

    // Sort by booking date descending
    webBookings.sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate));

    const report = {
      totalWebBookings: webBookings.length,
      totalTicketsSold: webBookings.reduce((sum, b) => sum + b.ticketsCount, 0),
      totalRevenue: webBookings.reduce((sum, b) => sum + b.amountPaid, 0),
      bookings: webBookings
    };

    fs.writeFileSync("odyssey_web_report.json", JSON.stringify(report, null, 2));
    console.log("Saved web booking details to odyssey_web_report.json.");

    await mongoose.disconnect();
  } catch (error) {
    console.error("Error:", error);
  }
}

run();
