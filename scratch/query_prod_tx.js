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
        console.log(`SSM Command sent: ${sendOutput}`);

        let attempts = 0;
        while (attempts < 30) {
            attempts++;
            await sleep(2000);

            try {
                const invocationRaw = execSync(`aws ssm get-command-invocation --command-id "${sendOutput}" --instance-id "i-01c1713a8fb9544b9" --output json`, { encoding: 'utf8' });
                const invocation = JSON.parse(invocationRaw);
                const status = invocation.Status;
                if (['Success', 'Failed', 'Cancelled', 'TimedOut'].includes(status)) {
                    console.log(`Status: ${status}`);
                    console.log('=== STDOUT ===\n' + invocation.StandardOutputContent);
                    if (invocation.StandardErrorContent) {
                        console.log('=== STDERR ===\n' + invocation.StandardErrorContent);
                    }
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
  const since = new Date(Date.now() - 48 * 3600 * 1000);
  const txs = await db.collection("transactions")
    .find({ createdAt: { $gte: since }, paymentsStatus: true })
    .project({ initTransId: 1, createdAt: 1, showId: 1, cinemaId: 1, movieId: 1, paymentsStatus: 1, commitStatus: 1, commitBookingData: 1, setSeatData: 1 })
    .sort({ createdAt: -1 })
    .toArray();

  for (const t of txs) {
    const show = t.showId ? await db.collection("shows").findOne({ _id: t.showId }) : null;
    const cinema = t.cinemaId ? await db.collection("cinemas").findOne({ _id: t.cinemaId }) : null;
    const movie = t.movieId ? await db.collection("movies").findOne({ _id: t.movieId }) : null;
    console.log("---");
    console.log("initTransId:", t.initTransId);
    console.log("createdAt:", t.createdAt);
    console.log("cinema:", cinema ? cinema.cinemaName : t.cinemaId);
    console.log("movie:", movie ? movie.name : t.movieId);
    console.log("seats:", t.commitBookingData?.strSeatInfo || t.setSeatData?.strSeatInfo);
    if (show) {
      console.log("showId:", show._id);
      console.log("sessionRealShow (Date):", show.sessionRealShow);
      console.log("screenName:", show.screenName);
    }
  }
  await mongoose.disconnect();
}
run();
'
`;

runSSM(remoteScript);
