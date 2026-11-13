const { MongoClient, ObjectId } = require('mongodb');

(async () => {
  const client = new MongoClient('mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin');
  await client.connect();
  const db = client.db();
  const patnaRegionId = new ObjectId('655f4ad8ce7b06677ad5f70a');
  const patnaCinemas = await db.collection('cinemas').find({ regionId: patnaRegionId, deletedStatus: 0 }).toArray();
  console.log('Patna cinemas count:', patnaCinemas.length);
  const patnaCinemaObjIds = patnaCinemas.map(c => c._id);
  const patnaMovies = await db.collection('movies').find({ cinemaObjectId: { '$in': patnaCinemaObjIds }, deletedStatus: 0 }).toArray();
  console.log('Patna movies count in movies collection:', patnaMovies.length);
  console.log('Sample movie status:', patnaMovies.slice(0, 5).map(m => ({ name: m.name, status: m.status, isActive: m.isActive, cinemaId: m.cinemaId, filmCode: m.filmCode })));

  // Check shows in Patna
  const now = new Date();
  const patnaShows = await db.collection('shows').find({ cinemaObjectId: { '$in': patnaCinemaObjIds }, sessionRealShow: { '$gte': now }, deletedStatus: 0, isActive: true }).toArray();
  console.log('Patna future shows:', patnaShows.length);
  console.log('Film object IDs in patna shows:', Array.from(new Set(patnaShows.map(s => s.filmObjectId?.toString()))));
  console.log('Film codes in patna shows:', Array.from(new Set(patnaShows.map(s => s.filmCode))));

  await client.close();
})();
