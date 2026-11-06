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
            } catch (err) {}
        }
    } finally {
        try { fs.unlinkSync(tempJsonPath); } catch (e) {}
    }
}

// Read local server.js and CouponCart.js
const serverJsContent = fs.readFileSync(path.join(__dirname, '..', 'Backend', 'server.js'), 'utf8');
const couponCartContent = fs.readFileSync(path.join(__dirname, '..', 'Backend', 'src', 'controller', 'user', 'CouponCart.js'), 'utf8');

// Encode as base64 to prevent shell quoting / escaping issues
const serverJsB64 = Buffer.from(serverJsContent).toString('base64');
const couponCartB64 = Buffer.from(couponCartContent).toString('base64');

const updateCommand = `
node -e "
const fs = require('fs');

const serverJsContent = Buffer.from('${serverJsB64}', 'base64').toString('utf8');
const couponCartContent = Buffer.from('${couponCartB64}', 'base64').toString('utf8');

// 1. Production updates
fs.writeFileSync('/home/ubuntu/connplex_backend/server.js', serverJsContent);
console.log('Updated /home/ubuntu/connplex_backend/server.js');

if (fs.existsSync('/home/ubuntu/connplex_backend/src/controller/user/CouponCart.js')) {
    fs.writeFileSync('/home/ubuntu/connplex_backend/src/controller/user/CouponCart.js', couponCartContent);
    console.log('Updated /home/ubuntu/connplex_backend/src/controller/user/CouponCart.js');
}

// 2. Staging updates (server.js - ensure correct PORT if staging uses different port)
if (fs.existsSync('/var/www/connplex-staging/Backend/server.js')) {
    // Check if staging uses a specific port
    let stagingServerJs = serverJsContent;
    fs.writeFileSync('/var/www/connplex-staging/Backend/server.js', stagingServerJs);
    console.log('Updated /var/www/connplex-staging/Backend/server.js');
}

if (fs.existsSync('/var/www/connplex-staging/Backend/src/controller/user/CouponCart.js')) {
    fs.writeFileSync('/var/www/connplex-staging/Backend/src/controller/user/CouponCart.js', couponCartContent);
    console.log('Updated /var/www/connplex-staging/Backend/src/controller/user/CouponCart.js');
}
"

echo "=== RESTART PM2 ==="
export PM2_HOME=/root/.pm2
pm2 restart connplex_backend
pm2 restart connplex-backend-staging
pm2 save

sleep 4

echo "=== PM2 STATUS ==="
pm2 list

echo "=== TOP PROCESSES ==="
ps aux --sort=-%cpu | head -n 10

echo "=== TEST LOCAL PROD GET-REGION ==="
curl -i -s -m 5 http://127.0.0.1:3021/api/user/get-region | head -n 20
`;

runSSM(updateCommand);
