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

  const tempJsonPath = path.join(__dirname, 'temp_ssm_log.json');
  fs.writeFileSync(tempJsonPath, JSON.stringify(jsonPayload, null, 2));

  try {
    const sendOutput = execSync(`aws ssm send-command --cli-input-json file://${tempJsonPath} --query "Command.CommandId" --output text`, { encoding: 'utf8' }).trim();
    let attempts = 0;
    while (attempts < 30) {
      attempts++;
      await sleep(2000);
      try {
        const invocationRaw = execSync(`aws ssm get-command-invocation --command-id "${sendOutput}" --instance-id "i-01c1713a8fb9544b9" --output json`, { encoding: 'utf8' });
        const invocation = JSON.parse(invocationRaw);
        if (['Success', 'Failed', 'Cancelled', 'TimedOut'].includes(invocation.Status)) {
          console.log('=== STDOUT ===\n' + invocation.StandardOutputContent);
          if (invocation.StandardErrorContent) console.log('=== STDERR ===\n' + invocation.StandardErrorContent);
          return invocation;
        }
      } catch (err) {}
    }
  } finally {
    try { fs.unlinkSync(tempJsonPath); } catch (e) {}
  }
}

async function main() {
  await runSSM(`
    echo "=== LAST 100 LINES OF /var/log/connplex_sync.log ==="
    tail -n 100 /var/log/connplex_sync.log || true
  `);
}

main().catch(console.error);
