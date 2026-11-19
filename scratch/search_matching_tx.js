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

  // Find all shows where sessionRealShow has hour/minute matching 11:30 (5:00 PM IST) or 13:15 (6:45 PM IST)
  // or 17:00 or 18:45
  const shows = await db.collection("shows").find({
    sessionRealShow: {
      $gte: new Date("2026-11-15T00:00:00.000Z"),
      $lte: new Date("2026-11-20T00:00:00.000Z")
    }
  }).toArray();

  const matchingShowIds = shows.filter(s => {
    const d = new Date(s.sessionRealShow);
    const utcHours = d.getUTCHours();
    const utcMins = d.getUTCMinutes();
    // 11:30 UTC is 17:00 IST (5:00 PM IST)
    // 13:15 UTC is 18:45 IST (6:45 PM IST)
    // 17:00 UTC is 22:30 IST
    // 18:45 UTC is 00:15 IST
    // or what if stored in local time: 17:00 or 18:45 or 06:30
    return (utcHours === 11 && utcMins === 30) ||
           (utcHours === 13 && utcMins === 15) ||
           (utcHours === 17 && utcMins === 0) ||
           (utcHours === 18 && utcMins === 45) ||
           (utcHours === 6 && utcMins === 30) ||
           (utcHours === 5 && utcMins === 0);
  }).map(s => s._id);

  console.log("Matching shows count:", matchingShowIds.length);

  const txs = await db.collection("transactions").find({
    showId: { $in: matchingShowIds },
    paymentsStatus: true
  }).toArray();

  console.log("Found transactions with matching show times:", txs.length);
  for (const t of txs) {
    const show = await db.collection("shows").findOne({ _id: t.showId });
    const cinema = await db.collection("cinemas").findOne({ _id: t.cinemaId });
    const user = t.userId ? await db.collection("users").findOne({ _id: t.userId }) : null;
    const webhook = await db.collection("webhookresponses").findOne({ initTransId: t.initTransId });
    console.log("-----------------------------------------");
    console.log("initTransId:", t.initTransId);
    console.log("created (UTC):", t.createdAt);
    console.log("created (IST):", new Date(t.createdAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }));
    console.log("cinema:", cinema?.cinemaName);
    console.log("seats:", t.commitBookingData?.strSeatInfo || t.setSeatData?.strSeatInfo);
    console.log("contact:", t.paymentResponse?.contact || user?.mobileNumber);
    console.log("userName:", (user?.firstName || "") + " " + (user?.lastName || ""));
    console.log("showId:", show?._id);
    console.log("show sessionRealShow (UTC):", show?.sessionRealShow?.toISOString());
    console.log("show sessionRealShow (IST):", show?.sessionRealShow ? new Date(show.sessionRealShow).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) : null);
    console.log("webhook payload showId:", webhook?.responseData?.showId);
  }

  await mongoose.disconnect();
}
run();
'
`;

runSSM(remoteScript);
