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
  
  // Search shows on 2026-11-18
  const shows = await db.collection("shows").find({
    sessionRealShow: {
      $gte: new Date("2026-11-17T18:30:00.000Z"),
      $lte: new Date("2026-11-18T20:00:00.000Z")
    }
  }).toArray();

  console.log("Found shows on Nov 18:", shows.length);
  for (const s of shows) {
    const d = new Date(s.sessionRealShow);
    const ist = d.toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", hour12: true });
    // Check if any transaction booked this show
    const count = await db.collection("transactions").countDocuments({ showId: s._id, paymentsStatus: true });
    if (count > 0 || ist.includes("6:45") || ist.includes("5:00") || ist.includes("6:30")) {
      const cinema = await db.collection("cinemas").findOne({ cinemaId: s.cinemaId });
      console.log(\`Show \${s._id} | Cinema: \${cinema?.cinemaName} (\${s.cinemaId}) | Screen: \${s.screenName} | Session: \${s.sessionId} | IST: \${ist} | UTC: \${s.sessionRealShow.toISOString()} | Bookings: \${count}\`);
      if (count > 0) {
        const txs = await db.collection("transactions").find({ showId: s._id, paymentsStatus: true }).toArray();
        for (const tx of txs) {
          console.log(\`   -> TX: \${tx.initTransId} | Created: \${tx.createdAt} | Contact: \${tx.paymentResponse?.contact}\`);
        }
      }
    }
  }
  await mongoose.disconnect();
}
run();
'
`;

runSSM(remoteScript);
