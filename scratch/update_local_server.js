const fs = require('fs');

let code = fs.readFileSync('Backend/server.js', 'utf8');
const searchBlock = /const optimizedSync = new CronJob\([\s\S]*?optimizedSync\.start\(\);/m;
const replacement = `// Cinema sync should not run on an aggressive 15-minute interval inside the customer-facing web process,
// as synchronizing 52 cinemas locks the Node.js event loop and saturates memory.
// Sync can be triggered manually from the Admin panel or run via dedicated background worker.
/*
const optimizedSync = new CronJob('0 4 * * *', async () => {
  console.log('Running nightly cinema sync job...');
  try {
    await syncAllCinema();
    console.log('Cinema sync completed successfully');
  } catch (error) {
    console.error('Cinema sync failed:', error);
  }
}, null, false, 'Asia/Kolkata');
*/`;

if (searchBlock.test(code)) {
    code = code.replace(searchBlock, replacement);
    fs.writeFileSync('Backend/server.js', code);
    console.log('Local Backend/server.js updated successfully!');
} else {
    console.log('Search block not matched!');
}
