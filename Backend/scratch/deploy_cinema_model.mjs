import fs from "fs";
import { exec } from "child_process";
import { promisify } from "util";

const execPromise = promisify(exec);
const INSTANCE_ID = "i-01c1713a8fb9544b9";
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runSsmCommand(commandStr) {
  const tmpParamsFile = "Backend/scratch/tmp_ssm_params.json";
  fs.writeFileSync(tmpParamsFile, JSON.stringify({ commands: [commandStr] }));

  const sendCmd = `aws ssm send-command --instance-ids "${INSTANCE_ID}" --document-name "AWS-RunShellScript" --parameters file://${tmpParamsFile} --output json`;

  const { stdout } = await execPromise(sendCmd);
  const cmdObj = JSON.parse(stdout);
  const commandId = cmdObj.Command.CommandId;

  let attempts = 0;
  while (attempts < 25) {
    await sleep(2000);
    try {
      const getCmd = `aws ssm get-command-invocation --command-id "${commandId}" --instance-id "${INSTANCE_ID}" --output json`;
      const { stdout: invOut } = await execPromise(getCmd);
      const invObj = JSON.parse(invOut);
      if (invObj.Status === "Success") {
        return invObj.StandardOutputContent;
      } else if (invObj.Status === "Failed" || invObj.Status === "Cancelled" || invObj.Status === "TimedOut") {
        throw new Error(`Command failed with status ${invObj.Status}: ${invObj.StandardErrorContent}`);
      }
    } catch (e) {
      if (e.message.includes("failed with status")) throw e;
    }
    attempts++;
  }
  throw new Error("Timed out waiting for SSM command completion");
}

async function deployFile(localPath, remotePath) {
  console.log(`Deploying ${localPath} -> ${remotePath}...`);
  const content = fs.readFileSync(localPath);
  const base64Content = content.toString("base64");

  const chunkSize = 25000;
  const totalChunks = Math.ceil(base64Content.length / chunkSize);

  await runSsmCommand(`rm -f /tmp/deploy_payload.b64`);

  for (let i = 0; i < totalChunks; i++) {
    const chunk = base64Content.slice(i * chunkSize, (i + 1) * chunkSize);
    await runSsmCommand(`echo -n "${chunk}" >> /tmp/deploy_payload.b64`);
  }

  const out = await runSsmCommand(`base64 -d /tmp/deploy_payload.b64 > ${remotePath} && rm -f /tmp/deploy_payload.b64 && ls -la ${remotePath}`);
  console.log(`✓ Deployed: ${out.trim()}`);
}

async function main() {
  await deployFile(
    "Backend/src/models/Cinema.js",
    "/home/ubuntu/connplex_backend/src/models/Cinema.js"
  );
  await deployFile(
    "Backend/server_sync_all_cinemas_batch.mjs",
    "/home/ubuntu/connplex_backend/server_sync_all_cinemas_batch.mjs"
  );
  console.log("Files deployed successfully!");
}

main().catch(console.error);
