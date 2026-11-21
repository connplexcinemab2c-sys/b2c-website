import mongoose from 'mongoose';
import axios from 'axios';

async function check() {
  await mongoose.connect('mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin');
  const db = mongoose.connection.db;

  console.log('--- Searching Korba in MongoDB ---');
  const cinemas = await db.collection('cinemas').find({
    $or: [
      { cinemaName: { $regex: 'korba', $options: 'i' } },
      { displayName: { $regex: 'korba', $options: 'i' } },
      { 'address.city': { $regex: 'korba', $options: 'i' } },
      { fullAddress: { $regex: 'korba', $options: 'i' } }
    ]
  }).toArray();

  console.log(`Found ${cinemas.length} cinema(s) matching Korba:`);
  for (const c of cinemas) {
    console.log(JSON.stringify(c, null, 2));
  }

  console.log('\n--- Checking Vista Central ---');
  try {
    const vistaRes = await axios.get('http://14.194.50.141/api.asmx/GetAllDetails?test=string', { timeout: 15000 });
    const vistaCinemas = vistaRes.data?.data?.CinemaList || [];
    const matchedVista = vistaCinemas.filter(v => 
      (v.Cinema_strName && v.Cinema_strName.toLowerCase().includes('korba')) ||
      (cinemas.some(c => c.cinemaId === v.Cinema_strID))
    );
    console.log('Matched Vista Central Cinemas:', JSON.stringify(matchedVista, null, 2));
  } catch (err) {
    console.error('Error fetching Vista central:', err.message);
  }

  await mongoose.disconnect();
}

check().catch(console.error);
