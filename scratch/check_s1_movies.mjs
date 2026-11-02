import mongoose from 'mongoose';

async function run() {
  await mongoose.connect('mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin');
  const db = mongoose.connection.db;

  const start = new Date('2026-11-01T00:00:00.000+05:30');
  const end = new Date('2026-11-01T23:59:59.999+05:30');

  const s1Txs = await db.collection('transactions').find({
    status: 1,
    createdAt: { $gte: start, $lte: end }
  }).toArray();

  const movies = await db.collection('movies').find({}, { projection: { name: 1 } }).toArray();
  const movieMap = {};
  for (const m of movies) movieMap[m._id.toString()] = m.name;

  const s1Movies = {};
  for (const t of s1Txs) {
    const mName = movieMap[t.movieId?.toString()] || t.movieId?.toString();
    s1Movies[mName] = (s1Movies[mName] || 0) + 1;
  }

  console.log('Status 1 (Successful) by Movie on 01/11/2026:');
  console.table(Object.entries(s1Movies).sort((a,b) => b[1] - a[1]).map(([movie, count]) => ({ movie, 'Success Count': count })));

  // Also check if ANY 3D movie succeeded at all
  const s1Ramayana = s1Txs.filter(t => (movieMap[t.movieId?.toString()] || '').toLowerCase().includes('ramayana'));
  console.log('Successful Ramayana bookings count:', s1Ramayana.length);
  if (s1Ramayana.length > 0) {
    for (const r of s1Ramayana) {
      console.log('Success Ramayana tx:', r.initTransId, r.cinemaId, movieMap[r.movieId?.toString()]);
    }
  }

  await mongoose.disconnect();
}

run();
