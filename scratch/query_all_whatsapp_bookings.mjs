import mongoose from 'mongoose';

async function run() {
  try {
    await mongoose.connect('mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin');
    const db = mongoose.connection.db;

    const distinctSources = await db.collection('transactions').distinct('utm_source');
    console.log('Distinct utm_source:', distinctSources);

    const earliestWa = await db.collection('transactions').find({
      utm_source: { $regex: /whatsapp/i }
    }).sort({ createdAt: 1 }).limit(5).toArray();

    console.log('\nEarliest 5 WhatsApp transactions:');
    for (const t of earliestWa) {
      console.log({
        id: t._id,
        createdAt: t.createdAt,
        status: t.status,
        paymentsStatus: t.paymentsStatus,
        commitStatus: t.commitStatus,
        utm_source: t.utm_source,
        utm_campaign: t.utm_campaign,
        movie: t.movieData?.name
      });
    }

    const latestWa = await db.collection('transactions').find({
      utm_source: { $regex: /whatsapp/i }
    }).sort({ createdAt: -1 }).limit(5).toArray();

    console.log('\nLatest 5 WhatsApp transactions:');
    for (const t of latestWa) {
      console.log({
        id: t._id,
        createdAt: t.createdAt,
        status: t.status,
        paymentsStatus: t.paymentsStatus,
        commitStatus: t.commitStatus,
        utm_source: t.utm_source,
        utm_campaign: t.utm_campaign,
        movie: t.movieData?.name
      });
    }

    const countTotal = await db.collection('transactions').countDocuments({
      utm_source: { $regex: /whatsapp/i }
    });
    console.log('\nTotal WhatsApp transactions in db:', countTotal);

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

run();
