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

            ws.on('message', (msgRaw) => {
                const msg = JSON.parse(msgRaw.toString());
                if (msg.method === 'Debugger.paused') {
                    const frames = msg.params.callFrames;
                    console.log('=== CALL FRAMES ===');
                    frames.slice(0, 10).forEach((f, idx) => {
                        console.log(\`[\${idx}] \${f.functionName} at \${f.url}:\${f.location.lineNumber}\`);
                    });

                    // Find frame with Query or completeMany or _find
                    let queryFrame = frames.find(f => f.functionName === '_find' || f.functionName === 'completeMany') || frames[frames.length - 2] || frames[0];
                    console.log('Evaluating on frame:', queryFrame.functionName);

                    ws.send(JSON.stringify({
                        id: 10,
                        method: 'Debugger.evaluateOnCallFrame',
                        params: {
                            callFrameId: queryFrame.callFrameId,
                            expression: '({ model: this && this.model ? this.model.modelName : null, filter: this && this._conditions ? JSON.stringify(this._conditions) : null, count: docs ? docs.length : null })',
                            returnByValue: true
                        }
                    }));
                } else if (msg.id === 10) {
                    console.log('=== EVALUATION RESULT ===');
                    console.log(JSON.stringify(msg.result, null, 2));
                    ws.send(JSON.stringify({ id: 3, method: 'Debugger.resume' }));
                    setTimeout(() => {
                        ws.close();
                        process.exit(0);
                    }, 500);
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

const tempJsonPath = path.join(__dirname, 'temp_pause.json');
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
