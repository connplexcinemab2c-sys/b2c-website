import mongoose from 'mongoose';

async function run() {
  await mongoose.connect('mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin');
  const db = mongoose.connection.db;

  const ids = [
    new mongoose.Types.ObjectId('6ae07192ce1750dd7e2fd9fc'),
    new mongoose.Types.ObjectId('6accb43c23ea8d428e4a132f'),
    new mongoose.Types.ObjectId('6ad2166c10a42a7e6ca626f5')
  ];

  const movies = await db.collection('movies').find({ _id: { $in: ids } }).toArray();
  for (const m of movies) {
    console.log(m._id.toString(), m.filmName || m.title || m.filmTitle || m.movieName || m.name);
  }

  await mongoose.disconnect();
}

run();
