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
    while (attempts < 40) {
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
  console.log('Deploying CinemaWiseDataSync.js and VistaService.js to server...');
  
  const cinemaWisePath = path.join(__dirname, '..', 'Backend', 'src', 'controller', 'admin', 'CinemaWiseDataSync.js');
  const cinemaWiseB64 = fs.readFileSync(cinemaWisePath).toString('base64');

  const vistaServicePath = path.join(__dirname, '..', 'Backend', 'src', 'services', 'VistaService.js');
  const vistaServiceB64 = fs.readFileSync(vistaServicePath).toString('base64');

  const deployCmd = `
node -e "
const fs = require('fs');
fs.writeFileSync('/home/ubuntu/connplex_backend/src/controller/admin/CinemaWiseDataSync.js', Buffer.from('${cinemaWiseB64}', 'base64'));
fs.writeFileSync('/home/ubuntu/connplex_backend/src/services/VistaService.js', Buffer.from('${vistaServiceB64}', 'base64'));
console.log('Files written successfully to /home/ubuntu/connplex_backend');
"

export PM2_HOME=/root/.pm2
sudo pm2 reload connplex_backend --update-env
echo "PM2 reload triggered."
`;

  await runSSM(deployCmd);
  console.log('Deployment complete!');
}

main().catch(console.error);
