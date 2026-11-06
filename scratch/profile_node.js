const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const env = { ...process.env, PYTHONIOENCODING: 'utf-8', PYTHONUTF8: '1' };

const rawProfilerJs = `
const http = require('http');
const WebSocket = require('/home/ubuntu/connplex_backend/node_modules/ws');

http.get('http://127.0.0.1:9229/json', (res) => {
    let data = '';
    res.on('data', c => data += c);
    res.on('end', async () => {
        try {
            const list = JSON.parse(data);
            const target = list[0];
            console.log('Connecting to target:', target.title, target.webSocketDebuggerUrl);

            const ws = new WebSocket(target.webSocketDebuggerUrl);
            ws.on('open', () => {
                let id = 1;
                ws.send(JSON.stringify({ id: id++, method: 'Profiler.enable' }));
                ws.send(JSON.stringify({ id: id++, method: 'Profiler.start' }));
                console.log('Collecting 2-second CPU profile...');
                setTimeout(() => {
                    ws.send(JSON.stringify({ id: 999, method: 'Profiler.stop' }));
                }, 2000);
            });

            ws.on('message', (msgRaw) => {
                const msg = JSON.parse(msgRaw.toString());
                if (msg.id === 999 && msg.result && msg.result.profile) {
                    const profile = msg.result.profile;
                    const samples = {};
                    for (const node of profile.nodes) {
                        const callFrame = node.callFrame;
                        const key = (callFrame.functionName || '(anonymous)') + ' at ' + callFrame.url + ':' + callFrame.lineNumber + ':' + callFrame.columnNumber;
                        samples[node.id] = key;
                    }
                    const hitCounts = {};
                    for (const sampleId of profile.samples || []) {
                        const key = samples[sampleId] || ('Node_' + sampleId);
                        hitCounts[key] = (hitCounts[key] || 0) + 1;
                    }
                    const sorted = Object.entries(hitCounts).sort((a,b) => b[1] - a[1]).slice(0, 20);
                    console.log('=== TOP CPU CONSUMING FUNCTIONS (2s SAMPLE) ===');
                    for (const [fn, hits] of sorted) {
                        console.log(hits + ' samples: ' + fn);
                    }
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

const profilerB64 = Buffer.from(rawProfilerJs).toString('base64');
const inspectScript = `
echo "${profilerB64}" | base64 -d | node
`;

const jsonPayload = {
    DocumentName: 'AWS-RunShellScript',
    InstanceIds: ['i-01c1713a8fb9544b9'],
    Parameters: { commands: [inspectScript] }
};

const tempJsonPath = path.join(__dirname, 'temp_prof.json');
fs.writeFileSync(tempJsonPath, JSON.stringify(jsonPayload));

try {
    const id = execSync(`aws ssm send-command --cli-input-json file://${tempJsonPath} --query "Command.CommandId" --output text`, { encoding: 'utf8', env }).trim();
    console.log('Command sent:', id);
    for (let i = 0; i < 20; i++) {
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
