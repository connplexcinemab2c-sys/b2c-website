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
            await sleep(2000);
            attempts++;
            const statusOutput = execSync(`aws ssm get-command-invocation --command-id "${sendOutput}" --instance-id "i-01c1713a8fb9544b9" --query "Status" --output text`, { encoding: 'utf8', env }).trim();
            if (statusOutput === 'Success' || statusOutput === 'Failed') {
                const response = execSync(`aws ssm get-command-invocation --command-id "${sendOutput}" --instance-id "i-01c1713a8fb9544b9" --output json`, { encoding: 'utf8', env });
                const parsed = JSON.parse(response);
                console.log("=== STDOUT ===");
                console.log(parsed.StandardOutputContent);
                if (parsed.StandardErrorContent) {
                    console.log("=== STDERR ===");
                    console.log(parsed.StandardErrorContent);
                }
                return parsed;
            }
        }
        console.log("Timed out waiting for command execution.");
    } finally {
        if (fs.existsSync(tempJsonPath)) fs.unlinkSync(tempJsonPath);
    }
}

runSSM(process.argv[2] || "pm2 logs connplex_backend --lines 80 --nostream");
