import mongoose from 'mongoose';

async function run() {
  await mongoose.connect('mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin');
  const db = mongoose.connection.db;

  const s2 = await db.collection('transactions').find({
    status: 2,
    createdAt: { $gte: new Date('2026-10-26T00:00:00.000+05:30') }
  }).limit(5).toArray();

  console.log("Status 2 sample records:");
  for (const s of s2) {
    console.log({
      id: s._id,
      transId: s.transId || s.initTransId,
      status: s.status,
      paymentsStatus: s.paymentsStatus,
      commitStatus: s.commitStatus,
      paymentResponse: s.paymentResponse ? {
        status: s.paymentResponse.status,
        error_code: s.paymentResponse.error_code,
        error_description: s.paymentResponse.error_description
      } : null,
      notes: s.notes
    });
  }

  // Also let's check what cinema names correspond to the failed ones
  const failedCinemaIds = [
    new mongoose.Types.ObjectId('68d3d2a3ca1b4239babd102a'),
    new mongoose.Types.ObjectId('68403e37e1598c38f743a2fe'),
    new mongoose.Types.ObjectId('68625695679549f33db7a06c') // Oct 25 one
  ];
  const cinemas = await db.collection('cinemas').find({ _id: { $in: failedCinemaIds } }).toArray();
  console.log("\nCinemas of failed bookings:");
  for (const c of cinemas) {
    console.log(`Cinema ID ${c._id}: ${c.cinemaName || c.name} (${c.cinemaId})`);
  }

  // Let's inspect the Oct 25 failure as well
  const oct25Failed = await db.collection('transactions').findOne({
    status: 4,
    createdAt: {
      $gte: new Date('2026-10-25T00:00:00.000+05:30'),
      $lte: new Date('2026-10-25T23:59:59.999+05:30')
    }
  });
  console.log("\nOct 25 failure details:", {
    transId: oct25Failed?.transId,
    cinemaId: oct25Failed?.cinemaId,
    vistaErrorResponse: oct25Failed?.vistaErrorResponse
  });

  await mongoose.disconnect();
}

run();
