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

const disableScript = `
node -e "
const fs = require('fs');

function commentOutOptimizedSync(filePath) {
    if (!fs.existsSync(filePath)) {
        console.log('File not found: ' + filePath);
        return;
    }
    let code = fs.readFileSync(filePath, 'utf8');
    
    // Replace const optimizedSync = ... with commented out version
    const target = /const\\s+optimizedSync\\s*=\\s*new\\s+CronJob\\([\\s\\S]*?\\);?\\s*\\n\\s*\\n?\\s*(\\/?\\/?\\s*optimizedSync\\.start\\(\\);?)?/g;
    
    if (target.test(code)) {
        code = code.replace(target, '/* optimizedSync disabled to prevent event loop freeze */\\n// const optimizedSync = ... disabled');
        fs.writeFileSync(filePath, code);
        console.log('Successfully disabled optimizedSync in ' + filePath);
    } else {
        console.log('Pattern not matched in ' + filePath + ', checking contents...');
    }
}

commentOutOptimizedSync('/home/ubuntu/connplex_backend/server.js');
commentOutOptimizedSync('/var/www/connplex-staging/Backend/server.js');
"

echo "=== VERIFY PRODUCTION ==="
grep -n -C 3 "optimizedSync" /home/ubuntu/connplex_backend/server.js

echo "=== VERIFY STAGING ==="
grep -n -C 3 "optimizedSync" /var/www/connplex-staging/Backend/server.js

echo "=== RESTART PM2 PROCESSES ==="
export PM2_HOME=/root/.pm2
pm2 restart connplex_backend
pm2 restart connplex-backend-staging
pm2 save

sleep 3
echo "=== PM2 LIST ==="
pm2 list
ps aux --sort=-%cpu | head -n 10
`;

runSSM(disableScript);
