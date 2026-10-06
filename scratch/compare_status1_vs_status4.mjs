import mongoose from 'mongoose';

async function run() {
  try {
    await mongoose.connect('mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin');
    const db = mongoose.connection.db;

    const start = new Date('2026-10-01T00:00:00.000+05:30');
    const end = new Date('2026-10-04T23:59:59.999+05:30');

    // Get 3 Status 1 transactions from ADANI SHANTIGRAM
    const s1Adani = await db.collection('transactions').find({
      deletedStatus: 0,
      createdAt: { $gte: start, $lte: end },
      status: 1,
      cinemaId: new mongoose.Types.ObjectId('6a15837a2585fc9aa9c18b22')
    }).limit(3).toArray();

    // Get 3 Status 4 transactions from ADANI SHANTIGRAM
    const s4Adani = await db.collection('transactions').find({
      deletedStatus: 0,
      createdAt: { $gte: start, $lte: end },
      status: 4,
      cinemaId: new mongoose.Types.ObjectId('6a15837a2585fc9aa9c18b22')
    }).limit(3).toArray();

    console.log("=== ADANI STATUS 1 (SUCCESS) SAMPLES ===");
    for (const t of s1Adani) {
      console.log({
        initTransId: t.initTransId,
        createdAt: t.createdAt,
        addSeat_intBookId: t.addSeatData?.intBookId,
        addSeat_curTotal: t.addSeatData?.curTotal,
        setSeat_intBookId: t.setSeatData?.intBookId,
        setSeat_strBookId: t.setSeatData?.strBookId,
        setSeat_curTotal: t.setSeatData?.curTotal,
        setSeat_intException: t.setSeatData?.intException,
        setSeat_strException: t.setSeatData?.strException,
        setSeat_strSeatInfo: t.setSeatData?.strSeatInfo,
        commit_strBookId: t.commitBookingData?.strBookId,
        commit_strSeatInfo: t.commitBookingData?.strSeatInfo,
        finalAmount: t.finalBookingCalculation?.finalAmount,
        discount: t.finalBookingCalculation?.ticketCart?.discountAmount
      });
    }

    console.log("\n=== ADANI STATUS 4 (FAILED) SAMPLES ===");
    for (const t of s4Adani) {
      console.log({
        initTransId: t.initTransId,
        createdAt: t.createdAt,
        addSeat_intBookId: t.addSeatData?.intBookId,
        addSeat_curTotal: t.addSeatData?.curTotal,
        setSeat_intBookId: t.setSeatData?.intBookId,
        setSeat_strBookId: t.setSeatData?.strBookId,
        setSeat_curTotal: t.setSeatData?.curTotal,
        setSeat_intException: t.setSeatData?.intException,
        setSeat_strException: t.setSeatData?.strException,
        setSeat_strSeatInfo: t.setSeatData?.strSeatInfo,
        commit_strBookId: t.commitBookingData?.strBookId,
        commit_strSeatInfo: t.commitBookingData?.strSeatInfo,
        finalAmount: t.finalBookingCalculation?.finalAmount,
        discount: t.finalBookingCalculation?.ticketCart?.discountAmount,
        vistaError: t.vistaErrorResponse
      });
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

run();
