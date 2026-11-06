import mongoose from 'mongoose';

async function run() {
  try {
    await mongoose.connect('mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin');
    const db = mongoose.connection.db;

    const octStart = new Date('2026-09-30T18:30:00.000Z');
    const octEnd = new Date('2026-10-31T18:29:59.999Z');

    // Samples of status 5 and status 4
    const status5 = await db.collection('transactions').find({
      createdAt: { $gte: octStart, $lte: octEnd },
      utm_source: { $regex: /whatsapp/i },
      status: 5
    }).limit(2).toArray();

    console.log('Sample Status 5:');
    for (const t of status5) {
      console.log({
        id: t._id,
        status: t.status,
        paymentsStatus: t.paymentsStatus,
        commitStatus: t.commitStatus,
        cancellationStatus: t.cancellationStatus,
        refundStatus: t.refundStatus,
        finalBookingCalculation: t.finalBookingCalculation?.finalAmount,
        commitBookingData: t.commitBookingData?.strBookId
      });
    }

    const status4 = await db.collection('transactions').find({
      createdAt: { $gte: octStart, $lte: octEnd },
      utm_source: { $regex: /whatsapp/i },
      status: 4
    }).limit(2).toArray();

    console.log('\nSample Status 4:');
    for (const t of status4) {
      console.log({
        id: t._id,
        status: t.status,
        paymentsStatus: t.paymentsStatus,
        commitStatus: t.commitStatus,
        cancellationStatus: t.cancellationStatus,
        refundStatus: t.refundStatus,
        finalBookingCalculation: t.finalBookingCalculation?.finalAmount,
        commitBookingData: t.commitBookingData?.strBookId
      });
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

run();
