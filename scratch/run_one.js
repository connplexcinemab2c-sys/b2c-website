const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const cmd = process.argv[2] || 'ps aux --sort=-%cpu | head -n 10';
const env = { ...process.env, PYTHONIOENCODING: 'utf-8', PYTHONUTF8: '1' };

const jsonPayload = {
    DocumentName: 'AWS-RunShellScript',
    InstanceIds: ['i-01c1713a8fb9544b9'],
    Parameters: { commands: [cmd] }
};

const tempJsonPath = path.join(__dirname, 'temp_one.json');
fs.writeFileSync(tempJsonPath, JSON.stringify(jsonPayload));

try {
    const id = execSync(`aws ssm send-command --cli-input-json file://${tempJsonPath} --query "Command.CommandId" --output text`, { encoding: 'utf8', env }).trim();
    let done = false;
    for (let i = 0; i < 15; i++) {
        execSync(process.platform === 'win32' ? 'node -e "setTimeout(()=>{}, 1500)"' : 'sleep 1.5');
        const raw = execSync(`aws ssm get-command-invocation --command-id "${id}" --instance-id "i-01c1713a8fb9544b9" --output json`, { encoding: 'utf8', env });
        const res = JSON.parse(raw);
        if (['Success', 'Failed'].includes(res.Status)) {
            console.log(res.StandardOutputContent);
            if (res.StandardErrorContent) console.error(res.StandardErrorContent);
            done = true;
            break;
        }
    }
    if (!done) console.log('Timeout waiting for SSM');
} finally {
    try { fs.unlinkSync(tempJsonPath); } catch (e) {}
}
