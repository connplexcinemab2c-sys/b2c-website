import mongoose from 'mongoose';

async function run() {
  try {
    await mongoose.connect('mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin');
    const db = mongoose.connection.db;

    const tx = await db.collection('transactions').findOne({
      initTransId: '20000081313'
    });

    console.log("=== TX 20000081313 ===");
    console.log("logs:", JSON.stringify(tx.logs, null, 2));

    // Check VistaLog
    const vLogs = await db.collection('vistalogs').find({
      $or: [
        { "data.strTransId": "20000081313" },
        { "data.strBookId": "WXS7X3T" },
        { "request.SessionId": "4911" },
        { "request.lngSessionId": 4911 }
      ]
    }).limit(5).toArray();

    console.log(`\nVistaLogs: ${vLogs.length}`);
    for (const v of vLogs) {
      console.log(JSON.stringify(v, null, 2));
    }

    // Check UniversalLogs
    const uLogs = await db.collection('universallogs').find({
      $or: [
        { "data.strTransId": "20000081313" },
        { "initTransId": "20000081313" },
        { "strTransId": "20000081313" }
      ]
    }).limit(5).toArray();

    console.log(`\nUniversalLogs: ${uLogs.length}`);
    for (const u of uLogs) {
      console.log(JSON.stringify(u, null, 2));
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

run();
