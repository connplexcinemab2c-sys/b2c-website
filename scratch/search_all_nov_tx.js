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

  // Let us find ALL transactions created in last 4 days where paymentsStatus is true
  const txs = await db.collection("transactions")
    .find({ createdAt: { $gte: new Date("2026-11-16T00:00:00.000Z") }, paymentsStatus: true })
    .toArray();

  console.log("Total txs:", txs.length);

  for (const t of txs) {
    const show = t.showId ? await db.collection("shows").findOne({ _id: t.showId }) : null;
    const cinema = t.cinemaId ? await db.collection("cinemas").findOne({ _id: t.cinemaId }) : null;
    const movie = t.movieId ? await db.collection("movies").findOne({ _id: t.movieId }) : null;
    
    const d = show?.sessionRealShow ? new Date(show.sessionRealShow) : null;
    const istShow = d ? d.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) : "NO_SHOW_DATE";
    const istCreated = new Date(t.createdAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
    const bookId = t.commitBookingData?.strBookId || t.addSeatData?.strBookId || "-";
    const seats = t.commitBookingData?.strSeatInfo || t.setSeatData?.strSeatInfo || "-";
    const contact = t.paymentResponse?.contact || t.normalized_phone || "-";

    console.log(\`\${t.initTransId} | BookId: \${bookId} | Contact: \${contact} | Cinema: \${cinema?.cinemaName} | Show: \${istShow} | Created: \${istCreated} | Seats: \${seats}\`);
  }

  await mongoose.disconnect();
}
run();
'
`;

runSSM(remoteScript);
