import fs from 'fs';
import path from 'path';

const backendDir = 'c:/Users/admin/Downloads/Connplex-B2C/Backend';
const rrpPath = path.join(backendDir, 'src/services/razorpay/RazorpayResponseHandler.js');
let rrpContent = fs.readFileSync(rrpPath, 'utf8').replace(/\r\n/g, '\n');

const target = `    // ── 1. Load user ──────────────────────────────────────────────────────────`;
const replacement = `    // ── TOP-LEVEL IDEMPOTENCY GUARD: Never re-process an already confirmed transaction!
    if (transId) {
      const existingTx = await Transaction.findOne({ initTransId: transId });
      if (existingTx && (existingTx.status === 1 || existingTx.commitStatus === true)) {
        console.log(\`[paymentResponse] Idempotency Hit: Transaction \${transId} is already confirmed (status: 1, commitStatus: true). Returning confirmation immediately.\`);
        return res.status(StatusCodes.OK).json({
          status: StatusCodes.OK,
          message: "Booking confirmed",
          redirectUrl: \`/confirmation-screen?transId=\${transId}\`,
        });
      }
    }

    // ── 1. Load user ──────────────────────────────────────────────────────────`;

if (rrpContent.includes(target)) {
  rrpContent = rrpContent.replace(target, replacement);
  fs.writeFileSync(rrpPath, rrpContent, 'utf8');
  console.log("Successfully added top-level idempotency guard to RazorpayResponseHandler.js");
} else {
  console.error("Target not found in RazorpayResponseHandler.js");
}
