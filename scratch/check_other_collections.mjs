import mongoose from 'mongoose';

async function run() {
  try {
    await mongoose.connect('mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin');
    const db = mongoose.connection.db;

    // Check collections
    const collections = await db.listCollections().toArray();
    console.log('Collections:', collections.map(c => c.name));

    // Check whatsapporders
    if (collections.some(c => c.name === 'whatsapporders')) {
      const waOrders = await db.collection('whatsapporders').find({
        $or: [
          { 'movie.name': { $regex: /ramayan/i } },
          { movieName: { $regex: /ramayan/i } }
        ]
      }).toArray();
      console.log('whatsapporders matching Ramayana:', waOrders.length);
    }

    // Check if there are other transactions where movie name in transaction itself has Ramayana (even if not linked to movie ID)
    const txOther = await db.collection('transactions').find({
      utm_source: { $regex: /whatsapp/i },
      $or: [
        { 'movieData.name': { $regex: /ramayan/i } },
        { movieName: { $regex: /ramayan/i } },
        { 'bookingData.movieName': { $regex: /ramayan/i } },
        { 'cart.movieName': { $regex: /ramayan/i } }
      ]
    }).toArray();
    console.log('Other direct Ramayana tx:', txOther.length);

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

run();
