const mongoose = require('mongoose');
const uri = 'mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin';

const targetIds = ['20000144987', '20000190161', '20000237010', '20000190499'];

async function run() {
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 15000 });
  const db = mongoose.connection.db;
  console.log('Connected to DB');

  const collections = await db.listCollections().toArray();
  console.log('Collections:', collections.map(c => c.name));

  for (const id of targetIds) {
    console.log('\n--- Searching for:', id, '---');
    const numId = Number(id);
    const query = {
      $or: [
        { transId: id }, { transId: numId },
        { initTransId: id }, { initTransId: numId },
        { bookingId: id }, { bookingId: numId },
        { orderId: id }, { orderId: numId },
        { 'paymentResponse.id': id },
        { 'vistaTransId': id }, { 'vistaTransId': numId },
        { 'commitBookingData.BookingId': id }, { 'commitBookingData.BookingId': numId },
        { 'commitBookingData.TransId': id }, { 'commitBookingData.TransId': numId },
        { 'commitBookingData.vistaTransId': id },
        { 'paymentResponse.notes.booking_id': id }
      ]
    };
    let res = await db.collection('transactions').findOne(query);
    if (res) {
      console.log('Found in transactions:', {
        _id: res._id,
        initTransId: res.initTransId,
        transId: res.transId,
        vistaTransId: res.vistaTransId,
        orderId: res.orderId,
        createdAt: res.createdAt,
        movieName: res.movieName || res.movieId,
        cinemaName: res.cinemaName || res.cinemaId,
        amount: res.finalAmount || res.totalAmount,
        seats: res.setSeatData?.strSeatInfo || res.seats,
        commitStatus: res.commitStatus,
        paymentStatus: res.paymentsStatus
      });
    } else {
      console.log('Not found by standard fields in transactions. Searching string match in transactions...');
      // Let's do a regex search or find where any string field contains it
      const sample = await db.collection('transactions').find({
        $text: { $search: id }
      }).limit(2).toArray().catch(() => []);
      
      if (sample.length > 0) {
        console.log('Found via text search:', sample);
      } else {
        // Let's search across other collections
        for (const col of collections) {
          const cName = col.name;
          const found = await db.collection(cName).findOne({
            $or: [
              { transId: id }, { transId: numId },
              { initTransId: id }, { initTransId: numId },
              { bookingId: id }, { bookingId: numId },
              { orderId: id }, { orderId: numId },
              { id: id }, { id: numId },
              { BookingId: id }, { BookingId: numId }
            ]
          }).catch(() => null);
          if (found) {
            console.log(`Found in collection "${cName}"!`, Object.keys(found));
          }
        }
      }
    }
  }

  process.exit(0);
}

run().catch(e => {
  console.error(e);
  process.exit(1);
});
