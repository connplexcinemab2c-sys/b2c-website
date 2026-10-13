import axios from 'axios';
import mongoose from 'mongoose';

const VISTA_URL = 'http://14.194.50.141';

const targetCinemas = ['CN01', 'CN42', 'CN30', 'CN93', 'CN26', 'CN35', 'CN95', 'CN39', 'CN96', 'CN44'];

async function main() {
  await mongoose.connect('mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin');
  const db = mongoose.connection.db;

  console.log('Testing Vista Central DatabaseSync for all 10 cinemas...\n');
  for (const cid of targetCinemas) {
    const c = await db.collection('cinemas').findOne({ cinemaId: cid });
    const url = `${VISTA_URL}/api.asmx/DatabaseSync?strCinemaId=${cid}`;
    const start = Date.now();
    try {
      const res = await axios.get(url, { timeout: 12000 });
      const sec = ((Date.now() - start) / 1000).toFixed(1);
      const isSuccess = res.data?.Status == '1';
      console.log(`${cid} (${c?.displayName || c?.cinemaName}) => Status: ${res.data?.Status} (${sec}s) - ${isSuccess ? 'SUCCESS' : 'FAILED: ' + JSON.stringify(res.data)}`);
      
      // Update lastSync and lastSyncStatus in DB
      await db.collection('cinemas').updateOne(
        { cinemaId: cid },
        { $set: { lastSync: new Date(), lastSyncStatus: isSuccess } }
      );
    } catch (e) {
      const sec = ((Date.now() - start) / 1000).toFixed(1);
      console.log(`${cid} (${c?.displayName || c?.cinemaName}) => ERROR: ${e.code || e.message} (${sec}s)`);
      await db.collection('cinemas').updateOne(
        { cinemaId: cid },
        { $set: { lastSync: new Date(), lastSyncStatus: false } }
      );
    }
  }

  await mongoose.disconnect();
}

main().catch(console.error);
