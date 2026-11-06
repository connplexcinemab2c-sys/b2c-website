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
                ws.send(JSON.stringify({ id: 1, method: 'Debugger.enable' }));
                ws.send(JSON.stringify({ id: 2, method: 'Debugger.pause' }));
            });

            ws.on('message', async (msgRaw) => {
                const msg = JSON.parse(msgRaw.toString());
                if (msg.method === 'Debugger.paused') {
                    const frames = msg.params.callFrames;
                    console.log('=== PAUSED AT ===');
                    for (let i = 0; i < Math.min(frames.length, 8); i++) {
                        const f = frames[i];
                        console.log(\`Frame \${i}: \${f.functionName} at \${f.url}:\${f.location.lineNumber}\`);
                        const localScope = f.scopeChain.find(s => s.type === 'local');
                        if (localScope && localScope.object.objectId) {
                            ws.send(JSON.stringify({
                                id: 100 + i,
                                method: 'Runtime.getProperties',
                                params: { objectId: localScope.object.objectId, ownProperties: true }
                            }));
                        }
                    }
                    setTimeout(() => {
                        ws.send(JSON.stringify({ id: 9999, method: 'Debugger.resume' }));
                        setTimeout(() => { ws.close(); process.exit(0); }, 300);
                    }, 1000);
                } else if (msg.id >= 100 && msg.id < 200) {
                    const frameIdx = msg.id - 100;
                    console.log(\`=== SCOPE FOR FRAME \${frameIdx} ===\`);
                    if (msg.result && msg.result.result) {
                        for (const prop of msg.result.result) {
                            const valDesc = prop.value ? (prop.value.description || prop.value.value || prop.value.type) : 'undefined';
                            console.log(\`  \${prop.name}: \${String(valDesc).slice(0, 100)}\`);
                        }
                    }
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

const tempJsonPath = path.join(__dirname, 'temp_inspect_frames.json');
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
