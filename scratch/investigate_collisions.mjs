import mongoose from 'mongoose';

async function run() {
  try {
    await mongoose.connect('mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin');
    const db = mongoose.connection.db;

    // Let's inspect 5 collision pairs in detail
    const sampleCollisions = [
      { failed: '20000040384', success: '20000061954' },
      { failed: '20000072995', success: '20000032533' },
      { failed: '20000040285', success: '20000011866' },
      { failed: '20000040247', success: '20000059236' },
      { failed: '20000039974', success: '20000086413' },
    ];

    for (const pair of sampleCollisions) {
      console.log(`\n======================================================`);
      console.log(`Comparing Failed TX: ${pair.failed} vs Success TX: ${pair.success}`);
      console.log(`======================================================`);

      const failedTx = await db.collection('transactions').findOne({ initTransId: pair.failed });
      const successTx = await db.collection('transactions').findOne({ initTransId: pair.success });

      console.log("FAILED TX:");
      console.log({
        initTransId: failedTx.initTransId,
        cinemaId: failedTx.cinemaId,
        createdAt: failedTx.createdAt,
        updatedAt: failedTx.updatedAt,
        status: failedTx.status,
        seats: failedTx.addSeatData?.strSeatInfo || failedTx.setSeatData?.strSeatInfo,
        sessionId: failedTx.paymentResponse?.notes?.sessionId || failedTx.addSeatData?.lngSessionId,
        userPhone: failedTx.paymentResponse?.contact || failedTx.normalized_phone,
        logs: failedTx.logs,
        vistaError: failedTx.vistaErrorResponse
      });

      console.log("\nSUCCESS TX:");
      console.log({
        initTransId: successTx.initTransId,
        cinemaId: successTx.cinemaId,
        createdAt: successTx.createdAt,
        updatedAt: successTx.updatedAt,
        status: successTx.status,
        seats: successTx.commitBookingData?.strSeatInfo || successTx.addSeatData?.strSeatInfo,
        sessionId: successTx.paymentResponse?.notes?.sessionId || successTx.addSeatData?.lngSessionId,
        userPhone: successTx.paymentResponse?.contact || successTx.normalized_phone,
        strBookId: successTx.commitBookingData?.strBookId,
        logs: successTx.logs
      });

      // Calculate time differences
      const failedCreated = new Date(failedTx.createdAt).getTime();
      const successCreated = new Date(successTx.createdAt).getTime();
      console.log(`\nTime diff (Success created - Failed created): ${Math.round((successCreated - failedCreated) / 1000)} seconds`);
    }

    // Now let's inspect the remaining 20 Status 4 transactions that did NOT have collisions!
    console.log(`\n======================================================`);
    console.log(`Inspecting non-colliding Status 4 transactions`);
    console.log(`======================================================`);

    const start = new Date('2026-10-01T00:00:00.000+05:30');
    const end = new Date('2026-10-04T23:59:59.999+05:30');
    const allStatus4 = await db.collection('transactions').find({
      deletedStatus: 0,
      createdAt: { $gte: start, $lte: end },
      status: 4
    }).toArray();

    for (const t of allStatus4) {
      const seats = t.addSeatData?.strSeatInfo || t.setSeatData?.strSeatInfo;
      const colliding = await db.collection('transactions').findOne({
        _id: { $ne: t._id },
        status: 1,
        $or: [
          { "addSeatData.strSeatInfo": seats },
          { "setSeatData.strSeatInfo": seats },
          { "commitBookingData.strSeatInfo": seats }
        ]
      });

      if (!colliding) {
        console.log({
          initTransId: t.initTransId,
          cinemaId: t.cinemaId,
          createdAt: t.createdAt,
          seats: seats,
          vistaErrorResponse: t.vistaErrorResponse,
          logs: t.logs
        });
      }
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

run();
