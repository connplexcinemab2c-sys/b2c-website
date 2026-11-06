const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const env = { ...process.env, PYTHONIOENCODING: 'utf-8', PYTHONUTF8: '1' };

const rawScript = `
const http = require('http');
const WebSocket = require('/home/ubuntu/connplex_backend/node_modules/ws');

http.get('http://127.0.0.1:9229/json', (res) => {
    let data = '';
    res.on('data', c => data += c);
    res.on('end', async () => {
        try {
            const list = JSON.parse(data);
            const target = list[0];
            const ws = new WebSocket(target.webSocketDebuggerUrl);

            ws.on('open', () => {
                const expr = \`
                (() => {
                    const mem = process.memoryUsage();
                    return {
                        rssMB: Math.round(mem.rss / 1024 / 1024),
                        heapTotalMB: Math.round(mem.heapTotal / 1024 / 1024),
                        heapUsedMB: Math.round(mem.heapUsed / 1024 / 1024),
                        externalMB: Math.round(mem.external / 1024 / 1024),
                    };
                })()
                \`;

                ws.send(JSON.stringify({
                    id: 1,
                    method: 'Runtime.evaluate',
                    params: { expression: expr, returnByValue: true }
                }));
            });

            ws.on('message', (msgRaw) => {
                const msg = JSON.parse(msgRaw.toString());
                if (msg.id === 1) {
                    console.log('=== MEMORY USAGE ===');
                    console.log(JSON.stringify(msg.result.value, null, 2));
                    ws.close();
                    process.exit(0);
                }
            });
        } catch (e) {
            console.error(e);
            process.exit(1);
        }
    });
});
`;

const scriptB64 = Buffer.from(rawScript).toString('base64');
const inspectScript = `echo "${scriptB64}" | base64 -d | node`;

const jsonPayload = {
    DocumentName: 'AWS-RunShellScript',
    InstanceIds: ['i-01c1713a8fb9544b9'],
    Parameters: { commands: [inspectScript] }
};

const tempJsonPath = path.join(__dirname, 'temp_mem.json');
fs.writeFileSync(tempJsonPath, JSON.stringify(jsonPayload));

try {
    const id = execSync(`aws ssm send-command --cli-input-json file://${tempJsonPath} --query "Command.CommandId" --output text`, { encoding: 'utf8', env }).trim();
    for (let i = 0; i < 15; i++) {
        execSync(process.platform === 'win32' ? 'node -e "setTimeout(()=>{}, 2000)"' : 'sleep 2');
        const raw = execSync(`aws ssm get-command-invocation --command-id "${id}" --instance-id "i-01c1713a8fb9544b9" --output json`, { encoding: 'utf8', env });
        const res = JSON.parse(raw);
        if (['Success', 'Failed'].includes(res.Status)) {
            console.log(res.StandardOutputContent);
            if (res.StandardErrorContent) console.error(res.StandardErrorContent);
            break;
        }
    }
} finally {
    try { fs.unlinkSync(tempJsonPath); } catch (e) {}
}
