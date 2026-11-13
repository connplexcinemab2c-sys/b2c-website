const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const env = { ...process.env, PYTHONIOENCODING: 'utf-8', PYTHONUTF8: '1' };

async function runSSM(commandString) {
    const jsonPayload = {
        DocumentName: 'AWS-RunShellScript',
        InstanceIds: ['i-01c1713a8fb9544b9'],
        Parameters: { commands: [commandString] }
    };
    const tempJsonPath = path.join(__dirname, 'temp_ssm_cmd.json');
    fs.writeFileSync(tempJsonPath, JSON.stringify(jsonPayload, null, 2));

    try {
        const sendOutput = execSync(`aws ssm send-command --cli-input-json file://${tempJsonPath} --query "Command.CommandId" --output text`, { encoding: 'utf8', env }).trim();
        let attempts = 0;
        while (attempts < 60) {
            attempts++;
            await sleep(2000);
            try {
                const invocationRaw = execSync(`aws ssm get-command-invocation --command-id "${sendOutput}" --instance-id "i-01c1713a8fb9544b9" --output json`, { encoding: 'utf8', env });
                const invocation = JSON.parse(invocationRaw);
                const status = invocation.Status;
                if (['Success', 'Failed', 'Cancelled', 'TimedOut'].includes(status)) {
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

const testContent = fs.readFileSync(path.join(__dirname, 'test_all_locations_api.js'), 'utf8');
const testB64 = Buffer.from(testContent).toString('base64');

const cmd = `
node -e "
const fs = require('fs');
fs.writeFileSync('/tmp/test_api.js', Buffer.from('${testB64}', 'base64').toString('utf8'));
"
export NODE_PATH=/home/ubuntu/connplex_backend/node_modules
node /tmp/test_api.js
`;

runSSM(cmd).catch(console.error);
