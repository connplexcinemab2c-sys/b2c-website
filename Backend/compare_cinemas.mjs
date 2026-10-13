import mongoose from 'mongoose';
import axios from 'axios';

async function main() {
  await mongoose.connect('mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin');
  const db = mongoose.connection.db;

  const mongoCinemas = await db.collection('cinemas').find({ deletedStatus: 0 }).toArray();
  const mongoMap = {};
  for (const c of mongoCinemas) {
    mongoMap[c.cinemaId] = c;
  }

  const vistaRes = await axios.get('http://14.194.50.141/api.asmx/GetAllDetails?test=string', { timeout: 15000 });
  const vistaCinemas = vistaRes.data?.data?.CinemaList || [];

  console.log(`Mongo active cinemas: ${mongoCinemas.length}, Vista Central cinemas: ${vistaCinemas.length}\n`);

  console.log('=== VISTA CENTRAL CINEMAS MATCHED TO MONGO ===');
  for (const vc of vistaCinemas) {
    const mc = mongoMap[vc.Cinema_strID];
    console.log(`ID: ${vc.Cinema_strID}`);
    console.log(`  Vista Name: ${vc.Cinema_strName}`);
    console.log(`  Mongo Name: ${mc ? (mc.displayName || mc.cinemaName) : '*** NOT IN MONGO ***'}`);
    console.log(`  Mongo isActive: ${mc?.isActive}, deleted: ${mc?.deletedStatus}`);
    console.log(`  Vista URL1: ${vc.Cinema_strWebServiceURL}`);
    console.log(`  Mongo URL1: ${mc?.cinemaWebServiceUrl}`);
    console.log(`  Mongo URL2: ${mc?.cinemaWebServiceUrl2}`);
  }

  console.log('\n=== MONGO CINEMAS NOT IN VISTA CENTRAL ===');
  const vistaMap = Object.fromEntries(vistaCinemas.map(v => [v.Cinema_strID, v]));
  for (const mc of mongoCinemas) {
    if (!vistaMap[mc.cinemaId]) {
      console.log(`ID: ${mc.cinemaId} | Mongo: ${mc.displayName || mc.cinemaName} | isActive: ${mc.isActive}`);
    }
  }

  await mongoose.disconnect();
}

main().catch(console.error);
