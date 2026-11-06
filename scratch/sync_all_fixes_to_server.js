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

// Read the files to deploy
const root = path.join(__dirname, '..', 'Backend');
const serverJs = fs.readFileSync(path.join(root, 'server.js'), 'utf8');
const couponCart = fs.readFileSync(path.join(root, 'src', 'controller', 'user', 'CouponCart.js'), 'utf8');
const booking = fs.readFileSync(path.join(root, 'src', 'controller', 'booking', 'Booking.js'), 'utf8');
const movies = fs.readFileSync(path.join(root, 'src', 'controller', 'user', 'Movies.js'), 'utf8');

const payload = {
    serverJs: Buffer.from(serverJs).toString('base64'),
    couponCart: Buffer.from(couponCart).toString('base64'),
    booking: Buffer.from(booking).toString('base64'),
    movies: Buffer.from(movies).toString('base64'),
};

const payloadJson = JSON.stringify(payload);
const payloadPath = path.join(__dirname, 'deploy_payload.json');
fs.writeFileSync(payloadPath, payloadJson);

const deployScript = `
node -e "
const fs = require('fs');
const payload = ${payloadJson};

function write(p, b64) {
    if (fs.existsSync(path.dirname(p))) {
        fs.writeFileSync(p, Buffer.from(b64, 'base64').toString('utf8'));
        console.log('Written: ' + p);
    }
}

const path = require('path');

// 1. Production
write('/home/ubuntu/connplex_backend/server.js', payload.serverJs);
write('/home/ubuntu/connplex_backend/src/controller/user/CouponCart.js', payload.couponCart);
write('/home/ubuntu/connplex_backend/src/controller/booking/Booking.js', payload.booking);
write('/home/ubuntu/connplex_backend/src/controller/user/Movies.js', payload.movies);

// 2. Staging
write('/var/www/connplex-staging/Backend/server.js', payload.serverJs);
write('/var/www/connplex-staging/Backend/src/controller/user/CouponCart.js', payload.couponCart);
write('/var/www/connplex-staging/Backend/src/controller/booking/Booking.js', payload.booking);
write('/var/www/connplex-staging/Backend/src/controller/user/Movies.js', payload.movies);
"

echo "=== RESTART PM2 PRODUCTION & STAGING ==="
export PM2_HOME=/root/.pm2
pm2 restart connplex_backend
pm2 restart connplex-backend-staging
pm2 save

sleep 4

echo "=== PM2 STATUS ==="
pm2 list

echo "=== TOP PROCESSES ==="
ps aux --sort=-%cpu | head -n 10

echo "=== MEMORY ==="
free -m

echo "=== TEST LOCAL PROD GET-REGION ==="
curl -i -s -w "\nTime: %{time_total}s\n" http://127.0.0.1:3021/api/user/get-region | head -n 25
`;

runSSM(deployScript);
