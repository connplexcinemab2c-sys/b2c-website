import mongoose from 'mongoose';

async function main() {
  try {
    await mongoose.connect('mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin');
    const db = mongoose.connection.db;
    
    console.log("Analyzing 3D identification on successful transactions...");
    
    const transactions = await db.collection("transactions")
      .find({ paymentsStatus: true, commitStatus: true })
      .toArray();
      
    console.log(`Total successful transactions: ${transactions.length}`);

    // Let's load all movies first for quick lookup
    const moviesList = await db.collection("movies").find({}).toArray();
    const moviesMap = new Map();
    moviesList.forEach(m => moviesMap.set(m._id.toString(), m));

    let identifiedOld = 0;
    let identifiedNew = 0;
    let mismatchCount = 0;

    transactions.forEach(tx => {
      const movie = tx.movieId ? moviesMap.get(tx.movieId.toString()) : null;
      
      const has3DOld = (movie?.movieType?.includes("3D")) || 
                       (tx.commitBookingData?.curTicketsTax3 > 0) || 
                       (tx.addSeatData?.curTicketsTax3 > 0);
                       
      const has3DNew = (movie?.movieType?.includes("3D")) || 
                       (movie?.name?.toUpperCase().includes("3D")) ||
                       (tx.commitBookingData?.curTicketsTax3 > 0) || 
                       (tx.addSeatData?.curTicketsTax3 > 0);

      if (has3DOld) identifiedOld++;
      if (has3DNew) identifiedNew++;
      if (has3DNew && !has3DOld) {
        mismatchCount++;
        if (mismatchCount <= 5) {
          console.log(`Mismatch #${mismatchCount}: Tx ID: ${tx._id}, Movie Name: "${movie?.name}", movieType: "${movie?.movieType}", curTicketsTax3: ${tx.commitBookingData?.curTicketsTax3}`);
        }
      }
    });

    console.log(`Identified with OLD logic: ${identifiedOld}`);
    console.log(`Identified with NEW logic: ${identifiedNew}`);
    console.log(`Difference (newly identified): ${identifiedNew - identifiedOld}`);

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

main();
