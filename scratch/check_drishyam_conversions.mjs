import mongoose from 'mongoose';

async function run() {
  try {
    await mongoose.connect('mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin');
    const db = mongoose.connection.db;

    const phones = [
      '919594102626', '9594102626',
      '919113154485', '9113154485',
      '917383397298', '7383397298',
      '918539893119', '8539893119',
      '919082367532', '9082367532',
      '916267514335', '6267514335',
      '919341098337', '9341098337',
      '919135382303', '9135382303',
      '918877222844', '8877222844',
      '919801812150', '9801812150'
    ];

    const mondayUtc = new Date("2026-09-27T18:30:00.000Z");

    const userDocs = await db.collection('users').find({
      mobileNumber: { $in: phones.map(p => Number(p.replace(/^91/, ''))).concat(phones) }
    }).toArray();
    console.log("Users found matching phones:", userDocs.length);
    const userIds = userDocs.map(u => u._id);

    const relatedTx = await db.collection('transactions').find({
      $or: [
        { normalized_phone: { $in: phones } },
        { "paymentResponse.contact": { $in: phones.map(p => '+' + p) } },
        { userId: { $in: userIds } }
      ],
      createdAt: { $gte: mondayUtc }
    }).toArray();

    console.log("Transactions for these users since Monday:", relatedTx.length);
    for (const t of relatedTx) {
      console.log({
        _id: t._id,
        createdAt: t.createdAt,
        status: t.status,
        utm_source: t.utm_source,
        phone: t.normalized_phone || t.paymentResponse?.contact
      });
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

run();
