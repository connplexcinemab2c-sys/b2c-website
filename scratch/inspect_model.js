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
                    const frame7 = frames.find(f => f.functionName === 'completeMany');
                    if (frame7) {
                        ws.send(JSON.stringify({
                            id: 777,
                            method: 'Debugger.evaluateOnCallFrame',
                            params: {
                                callFrameId: frame7.callFrameId,
                                expression: '({ modelName: model.modelName, collectionName: model.collection ? model.collection.name : null, docsCount: docs.length })',
                                returnByValue: true
                            }
                        }));
                    }
                } else if (msg.id === 777) {
                    console.log('=== MODEL INFO ===');
                    console.log(JSON.stringify(msg.result.result.value, null, 2));
                    ws.send(JSON.stringify({ id: 9999, method: 'Debugger.resume' }));
                    setTimeout(() => { ws.close(); process.exit(0); }, 300);
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

const tempJsonPath = path.join(__dirname, 'temp_inspect_model.json');
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
