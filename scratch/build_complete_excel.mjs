import mongoose from 'mongoose';
import path from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const XLSX = require('C:/Users/admin/Downloads/Connplex-B2C/Admin_frontend/node_modules/xlsx');

async function run() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect('mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin');
    const db = mongoose.connection.db;
    console.log('Connected to DB.');

    const startOct = new Date('2026-09-30T18:30:00.000Z'); // 2026-10-01 00:00:00 IST
    const endOct = new Date('2026-10-31T18:29:59.999Z');

    console.log('Fetching October transactions...');
    const txs = await db.collection('transactions').find({
      createdAt: { $gte: startOct, $lte: endOct }
    }, {
      projection: {
        logs: 0,
        foodAndBvgResponse: 0,
        fAndBDetails: 0,
        refundResponse: 0
      }
    }).sort({ createdAt: 1 }).toArray();

    console.log(`Fetched ${txs.length} transactions for October 2026.`);

    // Collect IDs
    const movieIds = new Set();
    const cinemaIds = new Set();
    for (const t of txs) {
      if (t.movieId) movieIds.add(t.movieId.toString());
      if (t.cinemaId) cinemaIds.add(t.cinemaId.toString());
    }

    // Lookup movies
    const movieDocs = await db.collection('movies').find({
      _id: { $in: Array.from(movieIds).map(id => new mongoose.Types.ObjectId(id)) }
    }).toArray();
    const movieMap = new Map();
    for (const m of movieDocs) {
      movieMap.set(m._id.toString(), m.name || m.title || "Unknown Movie");
    }

    // Lookup cinemas
    const cinemaDocs = await db.collection('cinemas').find({
      _id: { $in: Array.from(cinemaIds).map(id => new mongoose.Types.ObjectId(id)) }
    }).toArray();
    const cinemaMap = new Map();
    for (const c of cinemaDocs) {
      cinemaMap.set(c._id.toString(), {
        name: c.name || c.cinemaName || "Unknown Cinema",
        city: c.city || c.location || "-"
      });
    }

    const getStatusText = (status, paymentsStatus, commitStatus) => {
      if (status === 1 || (paymentsStatus === true && commitStatus === true)) return "Confirmed";
      if (status === 0) return "Initiated / Abandoned";
      if (status === 2 || status === 7) return "Cancelled";
      if (status === 3) return "Refunded";
      if (status === 4) return "Payment Success (Vista Failed/Pending)";
      if (status === 5) return "Payment Failed";
      if (status === 6) return "Timeout";
      return `Status ${status}`;
    };

    const parseSeatAndTickets = (t) => {
      let seatInfo = "";
      if (typeof t.commitBookingData?.strSeatInfo === 'string') seatInfo = t.commitBookingData.strSeatInfo;
      else if (typeof t.addSeatData?.strSeatInfo === 'string') seatInfo = t.addSeatData.strSeatInfo;
      else if (typeof t.setSeatData?.strSeatInfo === 'string') seatInfo = t.setSeatData.strSeatInfo;
      else if (typeof t.commitBookingData === 'string') seatInfo = t.commitBookingData;

      let ticketCount = 0;
      if (t.finalBookingCalculation?.ticketCart?.selectedSeats?.length) {
        ticketCount = t.finalBookingCalculation.ticketCart.selectedSeats.length;
      } else if (seatInfo && seatInfo.includes('-')) {
        const parts = seatInfo.split('-');
        ticketCount = parts[1].split(',').filter(s => s.trim().length > 0).length;
      } else if (seatInfo) {
        ticketCount = seatInfo.split(',').filter(s => s.trim().length > 0).length;
      }
      return { seatInfo, ticketCount };
    };

    const parseAmounts = (t) => {
      const ticketTotal = t.finalBookingCalculation?.ticketCart?.ticketTotal || 0;
      const fnbTotal = t.finalBookingCalculation?.foodCart?.fnbTotal || 0;
      const convFee = t.finalBookingCalculation?.convenienceFeesObject?.total || 0;
      const finalAmount = t.finalBookingCalculation?.finalAmount ||
                          t.finalBookingCalculation?.totalPayableAmount ||
                          (t.paymentResponse?.amount ? t.paymentResponse.amount / 100 : 0) ||
                          (ticketTotal + fnbTotal + convFee);
      return { ticketTotal, fnbTotal, convFee, finalAmount };
    };

    const parsedAll = [];
    for (const t of txs) {
      const istDate = new Date(new Date(t.createdAt).getTime() + 5.5 * 3600 * 1000)
        .toISOString().replace('T', ' ').substring(0, 19);
      const dateOnly = istDate.split(' ')[0];

      const movieName = movieMap.get(t.movieId?.toString()) || t.movieData?.name || "Unknown Movie";
      const cinemaInfo = cinemaMap.get(t.cinemaId?.toString()) || {
        name: t.cinemaData?.name || t.cinemaData?.cinemaName || "Unknown Cinema",
        city: t.city || t.cinemaData?.city || "-"
      };

      const { seatInfo, ticketCount } = parseSeatAndTickets(t);
      const { ticketTotal, fnbTotal, convFee, finalAmount } = parseAmounts(t);

      const isConfirmed = t.status === 1 || (t.paymentsStatus === true && t.commitStatus === true);
      const isWhatsApp = (t.utm_source && /whatsapp/i.test(t.utm_source)) || t.is_whatsapp_conversion === true;

      const bookingRef = t.commitBookingData?.strBookId ||
                         t.commitBookingData?.strBookIdEx ||
                         t.addSeatData?.strBookId ||
                         t.initTransId || "-";

      const contact = t.normalized_phone || t.paymentResponse?.contact || t.paymentDetail?.phone || "-";
      const email = t.paymentResponse?.email || t.paymentDetail?.email || "-";
      const paymentId = t.razorpayPaymentId || t.paymentResponse?.razorpay_payment_id || "-";
      const orderId = t.paymentResponse?.razorpay_order_id || t.orderId || "-";

      parsedAll.push({
        txId: t._id.toString(),
        initTransId: t.initTransId || "-",
        dateIST: istDate,
        dateOnlyIST: dateOnly,
        bookedFrom: t.bookedFrom || "web",
        utm_source: t.utm_source || "direct",
        utm_campaign: t.utm_campaign || "-",
        isWhatsApp,
        movieName,
        cinemaName: cinemaInfo.name,
        city: cinemaInfo.city,
        status: t.status,
        statusText: getStatusText(t.status, t.paymentsStatus, t.commitStatus),
        isConfirmed,
        seatInfo,
        ticketCount,
        ticketTotal: Number(ticketTotal.toFixed(2)),
        fnbTotal: Number(fnbTotal.toFixed(2)),
        convFee: Number(convFee.toFixed(2)),
        finalAmount: isConfirmed ? Number(finalAmount.toFixed(2)) : 0,
        unrealizedAmount: !isConfirmed ? Number(finalAmount.toFixed(2)) : 0,
        bookingRef,
        contact,
        email,
        paymentId,
        orderId,
        paymentMethod: t.paymentResponse?.method || "-"
      });
    }

    await mongoose.disconnect();
    console.log('Processed all transactions. Building Excel workbook...');

    const wb = XLSX.utils.book_new();

    // ----------------------------------------------------
    // TAB 1: EXECUTIVE SUMMARY
    // ----------------------------------------------------
    const waTransactions = parsedAll.filter(p => p.isWhatsApp);
    const waConfirmed = waTransactions.filter(p => p.isConfirmed);
    const webTransactions = parsedAll.filter(p => p.bookedFrom === 'web');
    const webConfirmed = webTransactions.filter(p => p.isConfirmed);

    const waRevenue = waConfirmed.reduce((s, p) => s + p.finalAmount, 0);
    const waTickets = waConfirmed.reduce((s, p) => s + p.ticketCount, 0);
    const webRevenue = webConfirmed.reduce((s, p) => s + p.finalAmount, 0);
    const webTickets = webConfirmed.reduce((s, p) => s + p.ticketCount, 0);

    const directConfirmed = webConfirmed.filter(p => !p.isWhatsApp);
    const directRevenue = directConfirmed.reduce((s, p) => s + p.finalAmount, 0);
    const directTickets = directConfirmed.reduce((s, p) => s + p.ticketCount, 0);

    const execSummaryRows = [
      ["CONNPLEX CINEMAS - OCTOBER 2026 TRANSACTION & REVENUE SUMMARY"],
      ["Report Generated:", new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + " IST"],
      ["Date Range:", "2026-10-01 to 2026-10-05 (Month-to-Date)"],
      [],
      ["CHANNEL PERFORMANCE OVERVIEW"],
      ["Channel / Traffic Source", "Total Sessions / Attempts", "Confirmed Bookings", "Tickets Sold", "Gross Realized Revenue (INR)", "Conversion Rate (%)"],
      ["WhatsApp Campaigns (utm_source=whatsapp)", waTransactions.length, waConfirmed.length, waTickets, waRevenue, Number(((waConfirmed.length / waTransactions.length) * 100).toFixed(2))],
      ["Website Direct & Other Channels", webTransactions.length - waTransactions.length, directConfirmed.length, directTickets, directRevenue, Number(((directConfirmed.length / (webTransactions.length - waTransactions.length)) * 100).toFixed(2))],
      ["TOTAL WEBSITE (bookedFrom: web)", webTransactions.length, webConfirmed.length, webTickets, webRevenue, Number(((webConfirmed.length / webTransactions.length) * 100).toFixed(2))],
      [],
      ["DAY-WISE REVENUE & BOOKING BREAKDOWN (OCTOBER 1 - 5, 2026)"],
      ["Date (IST)", "Website Sessions", "Website Confirmed", "Website Revenue (INR)", "WhatsApp Sessions", "WhatsApp Confirmed", "WhatsApp Revenue (INR)", "Total Realized Revenue (INR)"]
    ];

    const dayBreakdown = {};
    for (const p of parsedAll) {
      const day = p.dateOnlyIST;
      if (!dayBreakdown[day]) {
        dayBreakdown[day] = {
          webSessions: 0, webConfirmed: 0, webRevenue: 0,
          waSessions: 0, waConfirmed: 0, waRevenue: 0,
          totalRevenue: 0
        };
      }
      if (p.bookedFrom === 'web') dayBreakdown[day].webSessions += 1;
      if (p.isWhatsApp) dayBreakdown[day].waSessions += 1;
      if (p.isConfirmed) {
        dayBreakdown[day].totalRevenue += p.finalAmount;
        if (p.bookedFrom === 'web') {
          dayBreakdown[day].webConfirmed += 1;
          dayBreakdown[day].webRevenue += p.finalAmount;
        }
        if (p.isWhatsApp) {
          dayBreakdown[day].waConfirmed += 1;
          dayBreakdown[day].waRevenue += p.finalAmount;
        }
      }
    }

    for (const [day, d] of Object.entries(dayBreakdown).sort((a,b) => a[0].localeCompare(b[0]))) {
      execSummaryRows.push([
        day,
        d.webSessions,
        d.webConfirmed,
        Number(d.webRevenue.toFixed(2)),
        d.waSessions,
        d.waConfirmed,
        Number(d.waRevenue.toFixed(2)),
        Number(d.totalRevenue.toFixed(2))
      ]);
    }

    const wsSummary = XLSX.utils.aoa_to_sheet(execSummaryRows);
    wsSummary['!cols'] = [
      { wch: 42 }, { wch: 26 }, { wch: 20 }, { wch: 20 }, { wch: 28 }, { wch: 22 }, { wch: 24 }, { wch: 26 }
    ];
    XLSX.utils.book_append_sheet(wb, wsSummary, "Executive_Summary");

    // ----------------------------------------------------
    // TAB 2: MOVIE PERFORMANCE
    // ----------------------------------------------------
    const movieAgg = {};
    for (const p of webTransactions) {
      const m = p.movieName;
      if (!movieAgg[m]) {
        movieAgg[m] = {
          totalSessions: 0,
          confirmedBookings: 0,
          ticketsSold: 0,
          revenue: 0,
          waSessions: 0,
          waConfirmed: 0,
          waTickets: 0,
          waRevenue: 0,
          directConfirmed: 0,
          directRevenue: 0
        };
      }
      movieAgg[m].totalSessions += 1;
      if (p.isWhatsApp) movieAgg[m].waSessions += 1;

      if (p.isConfirmed) {
        movieAgg[m].confirmedBookings += 1;
        movieAgg[m].ticketsSold += p.ticketCount;
        movieAgg[m].revenue += p.finalAmount;
        if (p.isWhatsApp) {
          movieAgg[m].waConfirmed += 1;
          movieAgg[m].waTickets += p.ticketCount;
          movieAgg[m].waRevenue += p.finalAmount;
        } else {
          movieAgg[m].directConfirmed += 1;
          movieAgg[m].directRevenue += p.finalAmount;
        }
      }
    }

    const movieHeaders = [
      "Movie Name", "Total Website Sessions", "Total Confirmed Bookings", "Total Tickets Sold",
      "Total Revenue (INR)", "WhatsApp Sessions", "WhatsApp Confirmed", "WhatsApp Tickets",
      "WhatsApp Revenue (INR)", "Direct/Other Confirmed", "Direct/Other Revenue (INR)",
      "Conversion Rate (%)"
    ];

    const movieRows = Object.entries(movieAgg)
      .sort((a,b) => b[1].confirmedBookings - a[1].confirmedBookings)
      .map(([m, d]) => [
        m,
        d.totalSessions,
        d.confirmedBookings,
        d.ticketsSold,
        Number(d.revenue.toFixed(2)),
        d.waSessions,
        d.waConfirmed,
        d.waTickets,
        Number(d.waRevenue.toFixed(2)),
        d.directConfirmed,
        Number(d.directRevenue.toFixed(2)),
        Number(((d.confirmedBookings / (d.totalSessions || 1)) * 100).toFixed(2))
      ]);

    const wsMovies = XLSX.utils.aoa_to_sheet([movieHeaders, ...movieRows]);
    wsMovies['!cols'] = [
      { wch: 48 }, { wch: 22 }, { wch: 24 }, { wch: 18 }, { wch: 20 },
      { wch: 18 }, { wch: 20 }, { wch: 18 }, { wch: 22 }, { wch: 24 }, { wch: 24 }, { wch: 18 }
    ];
    XLSX.utils.book_append_sheet(wb, wsMovies, "Movie_Performance");

    // ----------------------------------------------------
    // TAB 3: WHATSAPP TRANSACTIONS
    // ----------------------------------------------------
    const waDetailHeaders = [
      "Date & Time (IST)", "Movie Name", "Cinema Name", "City", "Seats", "Tickets",
      "Ticket Total (INR)", "Total Paid (INR)", "Status", "Is Confirmed",
      "Customer Phone", "Customer Email", "Booking ID / Ref", "Razorpay Order ID",
      "Razorpay Payment ID", "Payment Method", "UTM Campaign"
    ];

    const waDetailRows = waTransactions.map(p => [
      p.dateIST,
      p.movieName,
      p.cinemaName,
      p.city,
      p.seatInfo,
      p.ticketCount,
      p.ticketTotal,
      p.isConfirmed ? p.finalAmount : p.unrealizedAmount,
      p.statusText,
      p.isConfirmed ? "YES" : "NO",
      p.contact,
      p.email,
      p.bookingRef,
      p.orderId,
      p.paymentId,
      p.paymentMethod,
      p.utm_campaign
    ]);

    const wsWa = XLSX.utils.aoa_to_sheet([waDetailHeaders, ...waDetailRows]);
    wsWa['!cols'] = [
      { wch: 20 }, { wch: 45 }, { wch: 38 }, { wch: 16 }, { wch: 22 }, { wch: 10 },
      { wch: 18 }, { wch: 16 }, { wch: 28 }, { wch: 14 }, { wch: 18 }, { wch: 25 },
      { wch: 18 }, { wch: 24 }, { wch: 22 }, { wch: 16 }, { wch: 22 }
    ];
    XLSX.utils.book_append_sheet(wb, wsWa, "WhatsApp_Transactions");

    // ----------------------------------------------------
    // TAB 4: WEBSITE CONFIRMED BOOKINGS
    // ----------------------------------------------------
    const webConfHeaders = [
      "Date & Time (IST)", "Movie Name", "Cinema Name", "City", "Channel / Source", "Seats", "Tickets",
      "Ticket Total (INR)", "Total Paid (INR)", "Status", "Customer Phone",
      "Customer Email", "Booking ID / Ref", "Razorpay Order ID", "Razorpay Payment ID",
      "Payment Method", "UTM Campaign"
    ];

    const webConfRows = webConfirmed.map(p => [
      p.dateIST,
      p.movieName,
      p.cinemaName,
      p.city,
      p.isWhatsApp ? "WhatsApp" : p.utm_source,
      p.seatInfo,
      p.ticketCount,
      p.ticketTotal,
      p.finalAmount,
      p.statusText,
      p.contact,
      p.email,
      p.bookingRef,
      p.orderId,
      p.paymentId,
      p.paymentMethod,
      p.utm_campaign
    ]);

    const wsWebConf = XLSX.utils.aoa_to_sheet([webConfHeaders, ...webConfRows]);
    wsWebConf['!cols'] = [
      { wch: 20 }, { wch: 45 }, { wch: 38 }, { wch: 16 }, { wch: 18 }, { wch: 22 }, { wch: 10 },
      { wch: 18 }, { wch: 16 }, { wch: 14 }, { wch: 18 }, { wch: 25 }, { wch: 18 },
      { wch: 24 }, { wch: 22 }, { wch: 16 }, { wch: 22 }
    ];
    XLSX.utils.book_append_sheet(wb, wsWebConf, "Website_Confirmed_Bookings");

    // ----------------------------------------------------
    // TAB 5: WHATSAPP BY CINEMA
    // ----------------------------------------------------
    const waByCinema = {};
    for (const p of waTransactions) {
      const c = p.cinemaName;
      if (!waByCinema[c]) {
        waByCinema[c] = { total: 0, confirmed: 0, tickets: 0, revenue: 0 };
      }
      waByCinema[c].total += 1;
      if (p.isConfirmed) {
        waByCinema[c].confirmed += 1;
        waByCinema[c].tickets += p.ticketCount;
        waByCinema[c].revenue += p.finalAmount;
      }
    }

    const waCinemaHeaders = [
      "Cinema Name", "Total WhatsApp Sessions", "Confirmed Bookings", "Tickets Sold",
      "Realized Revenue (INR)", "Conversion Rate (%)"
    ];
    const waCinemaRows = Object.entries(waByCinema)
      .sort((a,b) => b[1].confirmed - a[1].confirmed || b[1].revenue - a[1].revenue)
      .map(([c, d]) => [
        c,
        d.total,
        d.confirmed,
        d.tickets,
        Number(d.revenue.toFixed(2)),
        Number(((d.confirmed / (d.total || 1)) * 100).toFixed(2))
      ]);

    const wsWaCinema = XLSX.utils.aoa_to_sheet([waCinemaHeaders, ...waCinemaRows]);
    wsWaCinema['!cols'] = [
      { wch: 48 }, { wch: 24 }, { wch: 20 }, { wch: 16 }, { wch: 22 }, { wch: 20 }
    ];
    XLSX.utils.book_append_sheet(wb, wsWaCinema, "WhatsApp_By_Cinema");

    // Write workbook to file
    const outputPath = 'C:/Users/admin/Downloads/Connplex-B2C/october_2026_website_and_whatsapp_transactions.xlsx';
    XLSX.writeFile(wb, outputPath);
    console.log(`Excel file created successfully at: ${outputPath}`);

    // Also write to scratch
    XLSX.writeFile(wb, 'C:/Users/admin/Downloads/Connplex-B2C/scratch/october_2026_website_and_whatsapp_transactions.xlsx');
    console.log('Done.');
  } catch (err) {
    console.error('Error generating Excel file:', err);
  }
}

run();
