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

  const t = await db.collection("transactions").findOne({ initTransId: "20000117319" });
  console.log("TRANSACTION 20000117319:");
  console.log(JSON.stringify(t, null, 2));

  const show = await db.collection("shows").findOne({ _id: t.showId });
  console.log("SHOW:");
  console.log(JSON.stringify(show, null, 2));

  const webhook = await db.collection("webhookresponses").findOne({ initTransId: "20000117319" });
  console.log("WEBHOOK RESPONSE:");
  console.log(JSON.stringify(webhook, null, 2));

  const sms = await db.collection("smslogs").find({ mobileNumber: { $regex: String(t.userId || "") } }).toArray();
  console.log("SMS LOGS:", sms);

  await mongoose.disconnect();
}
run();
'
`;

runSSM(remoteScript);
