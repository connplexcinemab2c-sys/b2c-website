import mongoose from 'mongoose';

async function run() {
  try {
    await mongoose.connect('mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin');
    const db = mongoose.connection.db;

    const start = new Date('2026-10-01T00:00:00.000+05:30');
    const end = new Date('2026-10-04T23:59:59.999+05:30');

    const status4Txs = await db.collection('transactions').find({
      deletedStatus: 0,
      createdAt: { $gte: start, $lte: end },
      status: 4
    }).toArray();

    console.log(`Analyzing addSeatData and setSeatData across all ${status4Txs.length} Status 4 transactions...\n`);

    let hadAddSeatException = 0;
    let missingSeatInfoInAddSeat = 0;
    let addSeatExceptionCounts = {};
    let bookingFeeIssues = 0;
    let zeroBookId = 0;
    let zeroCurTotal = 0;

    for (const t of status4Txs) {
      const a = t.addSeatData;
      const s = t.setSeatData;

      if (!a) {
        console.log(`TX ${t.initTransId}: No addSeatData at all!`);
        continue;
      }

      if (a.intException && a.intException !== 0) {
        hadAddSeatException++;
        const ex = `${a.intException}: ${a.strException || 'No strException'}`;
        addSeatExceptionCounts[ex] = (addSeatExceptionCounts[ex] || 0) + 1;
      }

      if (!a.strSeatInfo || a.strSeatInfo === "") {
        missingSeatInfoInAddSeat++;
      }

      if (!a.intBookId || a.intBookId === 0) {
        zeroBookId++;
      }

      if (!a.curTicketsTotal || a.curTicketsTotal === 0) {
        zeroCurTotal++;
      }
    }

    console.log(`Status 4 Total: ${status4Txs.length}`);
    console.log(`Transactions where addSeatData had intException !== 0: ${hadAddSeatException}`);
    console.log(`addSeatData exceptions breakdown:`, addSeatExceptionCounts);
    console.log(`Transactions where addSeatData.strSeatInfo was EMPTY: ${missingSeatInfoInAddSeat}`);
    console.log(`Transactions where addSeatData.intBookId was 0 or missing: ${zeroBookId}`);
    console.log(`Transactions where addSeatData.curTicketsTotal was 0 or missing: ${zeroCurTotal}`);

    // Now let's print 10 transactions where addSeatData had NO exception (if any)
    const cleanAddSeats = status4Txs.filter(t => !t.addSeatData?.intException || t.addSeatData.intException === 0);
    console.log(`\nTransactions where addSeatData had NO exception: ${cleanAddSeats.length}`);
    for (const t of cleanAddSeats.slice(0, 10)) {
      console.log({
        initTransId: t.initTransId,
        cinemaId: t.cinemaId,
        addSeat_strSeatInfo: t.addSeatData?.strSeatInfo,
        setSeat_strSeatInfo: t.setSeatData?.strSeatInfo,
        addSeat_intBookId: t.addSeatData?.intBookId,
        addSeat_curTicketsTotal: t.addSeatData?.curTicketsTotal,
        finalBooking_ticketTotal: t.finalBookingCalculation?.ticketCart?.ticketTotal,
        finalBooking_finalAmount: t.finalBookingCalculation?.finalAmount,
        paid_amount: t.paymentResponse?.amount,
        vistaError: t.vistaErrorResponse?.data?.substring(0, 120)
      });
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

run();
