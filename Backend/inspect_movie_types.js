import mongoose from 'mongoose';

async function main() {
  try {
    await mongoose.connect('mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin');
    const db = mongoose.connection.db;
    
    console.log("Fetching unique movieType values...");
    const types = await db.collection("movies").distinct("movieType");
    console.log("Unique movie types:", types);

    console.log("Fetching a few sample movies...");
    const samples = await db.collection("movies")
      .find({
        $or: [
          { name: /3D/i },
          { movieType: /3D/i }
        ]
      })
      .limit(10)
      .toArray();

    samples.forEach(m => {
      console.log(`Movie: "${m.name}", movieType: "${m.movieType}" (type of movieType: ${typeof m.movieType})`);
    });

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

main();
