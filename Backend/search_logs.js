import mongoose from 'mongoose';

async function main() {
  try {
    await mongoose.connect('mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin');
    const db = mongoose.connection.db;
    
    const docs = await db.collection('logs').find({
      $or: [
        { title: /CN92/i },
        { title: /Junagadh/i },
        { message: /CN92/i },
        { message: /Junagadh/i },
        { cinemaId: new mongoose.Types.ObjectId('6a4670744a5d2aee11b1bd66') }
      ]
    }).toArray();

    console.log(`Found ${docs.length} matches in logs:`);
    docs.forEach(d => {
      console.log(JSON.stringify(d, null, 2));
    });
    
    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

main();
