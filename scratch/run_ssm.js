const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const env = { ...process.env, PYTHONIOENCODING: 'utf-8', PYTHONUTF8: '1' };

async function runSSM(commandString) {
    const jsonPayload = {
        DocumentName: 'AWS-RunShellScript',
        InstanceIds: ['i-01c1713a8fb9544b9'],
        Parameters: {
            commands: [commandString]
        }
    };

    const tempJsonPath = path.join(__dirname, 'temp_ssm_cmd.json');
    fs.writeFileSync(tempJsonPath, JSON.stringify(jsonPayload, null, 2));

    try {
        const sendOutput = execSync(`aws ssm send-command --cli-input-json file://${tempJsonPath} --query "Command.CommandId" --output text`, { encoding: 'utf8', env }).trim();
        console.log(`SSM Command sent: ${sendOutput}`);

        let attempts = 0;
        while (attempts < 30) {
            attempts++;
            await sleep(2000);

            try {
                const invocationRaw = execSync(`aws ssm get-command-invocation --command-id "${sendOutput}" --instance-id "i-01c1713a8fb9544b9" --output json`, { encoding: 'utf8', env });
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
            } catch (err) {
                console.log(`Waiting for invocation: ${err.message}`);
            }
        }
        console.log('Timed out waiting for SSM execution.');
    } finally {
        try { fs.unlinkSync(tempJsonPath); } catch (e) {}
    }
}

const script = `
export PM2_HOME=/root/.pm2
echo "=== PM2 LIST ==="
pm2 list
echo "=== TOP PROCESSES ==="
ps aux --sort=-%cpu | head -n 10
echo "=== MEMORY ==="
free -m
echo "=== LOCAL CURL TO BACKEND ==="
curl -i -s -m 5 http://127.0.0.1:3021/api/user/get-region | head -n 25
echo "=== LOCAL CURL VIA NGINX ==="
curl -i -s -m 5 -H "Host: backend.theconnplex.com" http://127.0.0.1/api/user/get-region | head -n 25
echo "=== NGINX ACCESS LOG ==="
tail -n 10 /var/log/nginx/access.log
echo "=== NGINX ERROR LOG ==="
tail -n 10 /var/log/nginx/error.log
`;

runSSM(script);
