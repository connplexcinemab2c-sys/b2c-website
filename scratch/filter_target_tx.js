const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

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
        const sendOutput = execSync(`aws ssm send-command --cli-input-json file://${tempJsonPath} --query "Command.CommandId" --output text`, { encoding: 'utf8' }).trim();

        let attempts = 0;
        while (attempts < 30) {
            attempts++;
            await sleep(2000);

            try {
                const invocationRaw = execSync(`aws ssm get-command-invocation --command-id "${sendOutput}" --instance-id "i-01c1713a8fb9544b9" --output json`, { encoding: 'utf8' });
                const invocation = JSON.parse(invocationRaw);
                const status = invocation.Status;
                if (['Success', 'Failed', 'Cancelled', 'TimedOut'].includes(status)) {
                    console.log('=== STDOUT ===\n' + invocation.StandardOutputContent);
                    return invocation;
                }
            } catch (err) {}
        }
    } finally {
        try { fs.unlinkSync(tempJsonPath); } catch (e) {}
    }
}

const remoteScript = `
node -e '
const mongoose = require("/home/ubuntu/connplex_backend/node_modules/mongoose");
async function run() {
  await mongoose.connect("mongodb://connplex:connple222023@localhost:27017/connplex?authSource=admin");
  const db = mongoose.connection.db;
  const start = new Date("2026-11-17T00:00:00.000Z");
  const end = new Date("2026-11-19T12:00:00.000Z");
  
  const txs = await db.collection("transactions")
    .find({ createdAt: { $gte: start, $lte: end }, paymentsStatus: true })
    .toArray();

  for (const t of txs) {
    const show = t.showId ? await db.collection("shows").findOne({ _id: t.showId }) : null;
    const cinema = t.cinemaId ? await db.collection("cinemas").findOne({ _id: t.cinemaId }) : null;
    const d = show?.sessionRealShow ? new Date(show.sessionRealShow) : null;
    let istTime = "-";
    let istDate = "-";
    let utcHour = "-";
    if (d) {
      istTime = d.toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", hour12: true });
      istDate = d.toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" });
      utcHour = d.toISOString();
    }
    const createdIST = new Date(t.createdAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
    
    // Look for anything with 6:45, 5:00, 6:30, or 17:00 or 18:45
    console.log([
      t.initTransId,
      createdIST,
      cinema?.cinemaName?.substring(0, 25),
      "RAW_UTC: " + utcHour,
      "IST_SHOW: " + istDate + " " + istTime
    ].join(" | "));
  }
  await mongoose.disconnect();
}
run();
'
`;

runSSM(remoteScript);
