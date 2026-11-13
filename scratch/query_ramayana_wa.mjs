import mongoose from 'mongoose';

async function run() {
  try {
    await mongoose.connect('mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin');
    const db = mongoose.connection.db;

    // 1. Search movies for "ramayana" or similar
    const movies = await db.collection('movies').find({
      $or: [
        { name: { $regex: /ramayan/i } },
        { title: { $regex: /ramayan/i } },
        { movieName: { $regex: /ramayan/i } }
      ]
    }).toArray();

    console.log(`Found ${movies.length} matching movies:`);
    movies.forEach(m => {
      console.log(`- ID: ${m._id}, Name: ${m.name || m.title || m.movieName}, Status: ${m.status}`);
    });

    const movieIds = movies.map(m => m._id);

    // Also check shows
    const shows = await db.collection('shows').find({
      $or: [
        { filmObjectId: { $in: movieIds } },
        { movieId: { $in: movieIds } },
        { movieName: { $regex: /ramayan/i } },
        { 'movieData.name': { $regex: /ramayan/i } }
      ]
    }).toArray();

    console.log(`Found ${shows.length} matching shows`);
    const showIds = shows.map(s => s._id);

    // Query transactions with utm_source: whatsapp
    const query = {
      utm_source: { $regex: /whatsapp/i },
      $or: [
        { movieId: { $in: movieIds } },
        { showId: { $in: showIds } },
        { movieName: { $regex: /ramayan/i } },
        { 'movieData.name': { $regex: /ramayan/i } }
      ]
    };

    const txs = await db.collection('transactions').find(query).sort({ createdAt: -1 }).toArray();
    console.log(`Found ${txs.length} transactions with utm_source=whatsapp for Ramayana.`);

    // If 0, let's also check all transactions matching ramayana regardless of utm_source to see what utm_source values they have
    if (txs.length === 0) {
      const allRamayanaTx = await db.collection('transactions').find({
        $or: [
          { movieId: { $in: movieIds } },
          { showId: { $in: showIds } },
          { movieName: { $regex: /ramayan/i } },
          { 'movieData.name': { $regex: /ramayan/i } }
        ]
      }).limit(50).toArray();
      console.log(`Total transactions for Ramayana (any utm_source): ${allRamayanaTx.length}`);
      const utmSources = [...new Set(allRamayanaTx.map(t => t.utm_source))];
      console.log('Distinct utm_source values in Ramayana txs:', utmSources);
    } else {
      console.log(JSON.stringify(txs.slice(0, 5), null, 2));
    }

    // Also let's check all distinct movie names or searches in transactions if nothing matched
    if (movies.length === 0) {
      const sampleTx = await db.collection('transactions').find({
        utm_source: { $regex: /whatsapp/i }
      }).limit(10).toArray();
      console.log('Sample WA transactions:', sampleTx.map(t => ({
        movieId: t.movieId,
        movieName: t.movieName,
        movieData: t.movieData?.name,
        utm_source: t.utm_source,
        createdAt: t.createdAt
      })));
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

run();
