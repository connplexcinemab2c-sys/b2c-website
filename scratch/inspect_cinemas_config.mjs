import mongoose from 'mongoose';

async function run() {
  try {
    await mongoose.connect('mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin');
    const db = mongoose.connection.db;

    const cinemas = await db.collection('cinemas').find({
      cinemaName: { $regex: /shantigram|khagaul|darbhanga|bhagalpur|vadodara/i }
    }).toArray();

    for (const c of cinemas) {
      console.log({
        _id: c._id,
        cinemaName: c.cinemaName,
        cinemaId: c.cinemaId,
        cinemaWebServiceUrl: c.cinemaWebServiceUrl,
        cinemaLicenseName: c.cinemaLicenseName,
        cinemaLicenseNumber: c.cinemaLicenseNumber,
        websiteLicenseNumber: c.websiteLicenseNumber,
        cinemaIsOnline: c.cinemaIsOnline,
      });
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

run();
