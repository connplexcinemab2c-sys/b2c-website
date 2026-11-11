const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
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
        for (let i = 0; i < 20; i++) {
            await sleep(2000);
            const invocationRaw = execSync(`aws ssm get-command-invocation --command-id "${sendOutput}" --instance-id "i-01c1713a8fb9544b9" --output json`, { encoding: 'utf8', env });
            const invocation = JSON.parse(invocationRaw);
            if (['Success', 'Failed', 'Cancelled', 'TimedOut'].includes(invocation.Status)) {
                console.log('=== STDOUT ===\n' + invocation.StandardOutputContent);
                if (invocation.StandardErrorContent) console.log('=== STDERR ===\n' + invocation.StandardErrorContent);
                return;
            }
        }
    } finally {
        try { fs.unlinkSync(tempJsonPath); } catch (e) {}
    }
}

const script = `
cat << 'EOF' > /tmp/check_log.js
const { MongoClient } = require('mongodb');
(async () => {
    const client = await MongoClient.connect("mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin");
    const doc = await client.db().collection('universallogs').find({}).sort({ _id: -1 }).limit(1).toArray();
    console.log(JSON.stringify(doc[0], null, 2));
    await client.close();
})();
EOF
export NODE_PATH=/home/ubuntu/connplex_backend/node_modules
node /tmp/check_log.js
`;

runSSM(script).catch(console.error);
