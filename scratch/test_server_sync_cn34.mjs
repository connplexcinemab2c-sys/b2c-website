import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runSSM(commandString) {
  const jsonPayload = {
    DocumentName: 'AWS-RunShellScript',
    InstanceIds: ['i-01c1713a8fb9544b9'],
    Parameters: { commands: [commandString] }
  };

  const tempJsonPath = path.join(__dirname, 'temp_ssm_cmd.json');
  fs.writeFileSync(tempJsonPath, JSON.stringify(jsonPayload, null, 2));

  try {
    const sendOutput = execSync(`aws ssm send-command --cli-input-json file://${tempJsonPath} --query "Command.CommandId" --output text`, { encoding: 'utf8' }).trim();
    console.log(`SSM Command sent: ${sendOutput}`);

    let attempts = 0;
    while (attempts < 60) {
      attempts++;
      await sleep(2000);

      try {
        const invocationRaw = execSync(`aws ssm get-command-invocation --command-id "${sendOutput}" --instance-id "i-01c1713a8fb9544b9" --output json`, { encoding: 'utf8' });
        const invocation = JSON.parse(invocationRaw);
        const status = invocation.Status;
        if (['Success', 'Failed', 'Cancelled', 'TimedOut'].includes(status)) {
          console.log(`Status: ${status}`);
          console.log('=== STDOUT ===\n' + invocation.StandardOutputContent);
          if (invocation.StandardErrorContent) {
            console.log('=== STDERR ===\n' + invocation.StandardErrorContent);
          }
          return invocation;
        }
      } catch (err) {}
    }
  } finally {
    try { fs.unlinkSync(tempJsonPath); } catch (e) {}
  }
}

async function main() {
  console.log('Testing sync for CN34 on server...');
  const testCmd = `
cd /home/ubuntu/connplex_backend
node -e "
import('./src/controller/admin/CinemaWiseDataSync.js').then(async ({ showSync, todayShowSync }) => {
  const axios = (await import('axios')).default;
  const mongoose = (await import('mongoose')).default;
  await mongoose.connect(process.env.MONGO_URL);

  const sessRes = await axios.get('http://14.194.50.141/api.asmx/GetCinemawiseSession?CinemaID=CN34');
  console.log('Fetched CN34 sessions from Vista:', sessRes.data?.data?.SessionList?.length);

  await showSync('CN34', sessRes);
  await todayShowSync('CN34', sessRes);

  const activeO = await mongoose.connection.db.collection('shows').countDocuments({ cinemaId: 'CN34', screenStatus: 'O', sessionRealShow: { \\$gte: new Date() } });
  const activeC = await mongoose.connection.db.collection('shows').countDocuments({ cinemaId: 'CN34', screenStatus: 'C', sessionRealShow: { \\$gte: new Date() } });
  console.log('Future shows for CN34 in DB after sync -> screenStatus O:', activeO, 'screenStatus C:', activeC);

  await mongoose.disconnect();
});
"
`;

  await runSSM(testCmd);
}

main().catch(console.error);
