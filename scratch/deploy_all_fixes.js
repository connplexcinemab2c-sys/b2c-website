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
        while (attempts < 60) {
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

// Read updated files
const moviesJsContent = fs.readFileSync(path.join(__dirname, '..', 'Backend', 'src', 'controller', 'user', 'Movies.js'), 'utf8');
const bookingJsContent = fs.readFileSync(path.join(__dirname, '..', 'Backend', 'src', 'controller', 'booking', 'Booking.js'), 'utf8');
const batchSyncContent = fs.readFileSync(path.join(__dirname, 'server_sync_all_cinemas_batch.mjs'), 'utf8');

const moviesJsB64 = Buffer.from(moviesJsContent).toString('base64');
const bookingJsB64 = Buffer.from(bookingJsContent).toString('base64');
const batchSyncB64 = Buffer.from(batchSyncContent).toString('base64');

const updateCommand = `
node -e "
const fs = require('fs');

const moviesContent = Buffer.from('${moviesJsB64}', 'base64').toString('utf8');
const bookingContent = Buffer.from('${bookingJsB64}', 'base64').toString('utf8');
const batchSyncContent = Buffer.from('${batchSyncB64}', 'base64').toString('utf8');

// 1. Deploy to /home/ubuntu/connplex_backend
fs.writeFileSync('/home/ubuntu/connplex_backend/src/controller/user/Movies.js', moviesContent);
fs.writeFileSync('/home/ubuntu/connplex_backend/src/controller/booking/Booking.js', bookingContent);
fs.writeFileSync('/home/ubuntu/connplex_backend/server_sync_all_cinemas_batch.mjs', batchSyncContent);
console.log('Deployed Movies.js, Booking.js, server_sync_all_cinemas_batch.mjs to production');

// 2. Deploy to staging if exists
if (fs.existsSync('/var/www/connplex-staging/Backend/src/controller/user/Movies.js')) {
  fs.writeFileSync('/var/www/connplex-staging/Backend/src/controller/user/Movies.js', moviesContent);
  fs.writeFileSync('/var/www/connplex-staging/Backend/src/controller/booking/Booking.js', bookingContent);
  console.log('Deployed to staging backend');
}
"
export PM2_HOME=/root/.pm2
pm2 reload connplex_backend
pm2 reload connplex-backend-staging
`;

async function deploy() {
    console.log('Uploading updated backend files and reloading PM2...');
    await runSSM(updateCommand);
    console.log('\n--- Running full batch cinema sync on server ---');
    await runSSM('cd /home/ubuntu/connplex_backend && node server_sync_all_cinemas_batch.mjs');
}

deploy().catch(console.error);
