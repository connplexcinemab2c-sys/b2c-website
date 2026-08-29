import mongoose from 'mongoose';

async function main() {
  try {
    await mongoose.connect('mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin');
    const db = mongoose.connection.db;
    
    console.log("Searching for transactions with 3D indicators...");
    
    // Find movies with 3D in their name or type
    const movie3DList = await db.collection("movies")
      .find({
        $or: [
          { name: /3D/i },
          { movieType: /3D/i }
        ]
      })
      .toArray();
      
    const movie3DIds = movie3DList.map(m => m._id);
    console.log(`Found ${movie3DList.length} 3D movies. Movie IDs:`, movie3DIds);

    // Find transactions referencing these movies or having curTicketsTax3 > 0
    const query = {
      $or: [
        { movieId: { $in: movie3DIds } },
        { "commitBookingData.curTicketsTax3": { $gt: 0 } },
        { "addSeatData.curTicketsTax3": { $gt: 0 } }
      ]
    };
    
    const count = await db.collection("transactions").countDocuments(query);
    console.log(`Found ${count} transactions matching 3D query.`);
    
    if (count > 0) {
      const txs = await db.collection("transactions")
        .find(query)
        .sort({ createdAt: -1 })
        .limit(5)
        .toArray();
        
      for (let i = 0; i < txs.length; i++) {
        const tx = txs[i];
        console.log(`\n================ 3D TRANSACTION #${i + 1} ================`);
        console.log("ID:", tx._id);
        console.log("Movie ID:", tx.movieId);
        const movie = movie3DList.find(m => m._id.toString() === tx.movieId?.toString());
        console.log("Movie details:", movie ? { name: movie.name, movieType: movie.movieType } : "Not found in 3D list");
        console.log("commitBookingData.curTicketsTax3:", tx.commitBookingData?.curTicketsTax3);
        console.log("addSeatData.curTicketsTax3:", tx.addSeatData?.curTicketsTax3);
        console.log("finalBookingCalculation keys:", tx.finalBookingCalculation ? Object.keys(tx.finalBookingCalculation) : null);
        if (tx.finalBookingCalculation) {
          console.log("finalBookingCalculation.ticketCart:", JSON.stringify(tx.finalBookingCalculation.ticketCart, null, 2));
        }
      }
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

main();
