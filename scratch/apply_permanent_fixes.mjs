import fs from 'fs';
import path from 'path';

const backendDir = 'c:/Users/admin/Downloads/Connplex-B2C/Backend';

// 1. Update RazorpayResponseHandler.js
const rrpPath = path.join(backendDir, 'src/services/razorpay/RazorpayResponseHandler.js');
let rrpContent = fs.readFileSync(rrpPath, 'utf8');

// A. Guard in paymentStatus !== "success"
const targetA = `    if (paymentStatus !== "success") {
      // Build full payment response — capture every field Razorpay sends so the`;
const replA = `    if (paymentStatus !== "success") {
      // ── CRITICAL GUARD: Never overwrite an already confirmed/booked transaction
      const existingTx = await Transaction.findOne({ initTransId: transId });
      if (existingTx && (existingTx.status === 1 || existingTx.commitStatus === true)) {
        console.log(\`[paymentResponse] Transaction \${transId} is already confirmed (status: 1). Ignoring subsequent '\${paymentStatus}' event.\`);
        return res.status(StatusCodes.OK).json({
          status: StatusCodes.OK,
          message: "Booking already confirmed",
          redirectUrl: \`/confirmation-screen?transId=\${transId}\`,
        });
      }

      // Build full payment response — capture every field Razorpay sends so the`;

// B. Session window check: extend from strict 10m to 15m and add auto-refund
const targetB = `    // ── 7. Calculate booking session window (10 minutes from Transaction.createdAt)
    const isSessionExpired =
      moment().diff(moment(bookingData?.createdAt), "minutes", true) > 10;

    console.log("booking session expiry check - expired:", isSessionExpired);`;
const replB = `    // ── 7. Calculate booking session window (15 minutes from Transaction.createdAt)
    const sessionAgeMinutes = moment().diff(moment(bookingData?.createdAt), "minutes", true);
    const isSessionExpired = sessionAgeMinutes > 15;

    console.log("booking session expiry check - expired:", isSessionExpired, \`(\${sessionAgeMinutes.toFixed(1)} mins)\`);`;

const targetB2 = `    if (isSessionExpired) {
      console.log("Booking time exceeded 10 minutes");

      createLog({
        transaction_id: transId,
        type: "Booking",
        step: {
          success: false,
          logType: "vistaBookingResponse",
          message: "Ticket Booking Failed",
          error: "Booking time exceeded 10 minutes",
          timestamp: new Date().toISOString(),
        },
      });

      // DB → Transaction / SubscriptionTransaction  status: 5 
      // Log → Transaction.logs  { paymentFailed: Date }
      await _handlePaymentFailedDb(transId, razorpayPaymentData, userId);

      return res.status(StatusCodes.OK).json({
        status: StatusCodes.OK,
        message: "Booking session expired",
        redirectUrl: \`/transaction-failed?transId=\${transId}\`,
      });
    }`;

const replB2 = `    if (isSessionExpired) {
      console.log(\`Booking time exceeded 15 minutes (\${sessionAgeMinutes.toFixed(1)} mins) — initiating auto-refund\`);

      createLog({
        transaction_id: transId,
        type: "Booking",
        step: {
          success: false,
          logType: "vistaBookingResponse",
          message: "Ticket Booking Failed - Session Expired",
          error: "Booking time exceeded session limit (15 mins)",
          timestamp: new Date().toISOString(),
        },
      });

      // Auto-refund user immediately if payment was captured
      const shouldRefund = process.env.VISTA_TICKET_REFUND !== "false";
      if (shouldRefund && razorpay_payment_id) {
        const refundAmt = Number(razorpayPaymentData.amount) || Number(bookingData?.finalBookingCalculation?.finalAmount) || 0;
        if (refundAmt > 0) {
          console.log(\`[AutoRefund] Refunding expired session booking \${transId} for ₹\${refundAmt}\`);
          await refundRazorpay(razorpay_payment_id, refundAmt, transId).catch(console.error);
        }
      }

      // DB → Transaction / SubscriptionTransaction  status: 5 
      // Log → Transaction.logs  { paymentFailed: Date }
      await _handlePaymentFailedDb(transId, razorpayPaymentData, userId);

      return res.status(StatusCodes.OK).json({
        status: StatusCodes.OK,
        message: "Booking session expired. Refund initiated.",
        redirectUrl: \`/transaction-failed?transId=\${transId}\`,
      });
    }`;

// C. _handleTicketFailed auto-refund
const targetC = `export const _handleTicketFailed = async (
  strTransId,
  razorpayPaymentData,
  user,
  userId,
  vistaErrorResponse
) => {
  if (process.env.VISTA_TICKET_REFUND === "true") {
    await refundRazorpay(
      razorpayPaymentData.razorpay_payment_id,
      razorpayPaymentData.amount,
      strTransId
    ).catch(console.error);
  }`;

const replC = `export const _handleTicketFailed = async (
  strTransId,
  razorpayPaymentData,
  user,
  userId,
  vistaErrorResponse
) => {
  const shouldRefund = process.env.VISTA_TICKET_REFUND !== "false";
  if (shouldRefund && razorpayPaymentData?.razorpay_payment_id) {
    const refundAmount =
      Number(razorpayPaymentData.amount) ||
      Number(razorpayPaymentData.finalAmount) ||
      0;
    if (refundAmount > 0) {
      console.log(\`[AutoRefund] Initiating auto-refund of ₹\${refundAmount} for failed booking \${strTransId}\`);
      await refundRazorpay(
        razorpayPaymentData.razorpay_payment_id,
        refundAmount,
        strTransId
      ).catch((err) => console.error("Auto-refund failed in _handleTicketFailed:", err?.message));
    }
  }`;

// D. _handlePaymentFailedDb guard
const targetD = `// Private — payment-failure side-effects
export const _handlePaymentFailedDb = async (strTransId, paymentData, userId) => {
  const update = {
    $set: {
      paymentResponse: paymentData,
      paymentsStatus: false,
      userId,
      status: 5,
    },
    $push: { logs: { paymentFailed: new Date() } },
  };

  let updated = await SubscriptionTransaction.findOneAndUpdate(
    { initTransId: strTransId },
    update,
    { new: true }
  ).sort({ createdAt: -1 });

  if (!updated) {
    updated = await Transaction.findOneAndUpdate(
      { initTransId: strTransId },
      update,
      { new: true }
    ).sort({ createdAt: -1 });
  }

  return updated;
};`;

const replD = `// Private — payment-failure side-effects
export const _handlePaymentFailedDb = async (strTransId, paymentData, userId) => {
  // CRITICAL GUARD: Never overwrite an already booked transaction!
  const existingTx = await Transaction.findOne({ initTransId: strTransId });
  if (existingTx && (existingTx.status === 1 || existingTx.commitStatus === true)) {
    console.warn(\`[Guard] Blocked attempt to mark successfully booked transaction \${strTransId} as failed.\`);
    return existingTx;
  }

  const existingSub = await SubscriptionTransaction.findOne({ initTransId: strTransId });
  if (existingSub && (existingSub.status === 1 || existingSub.paymentsStatus === true)) {
    console.warn(\`[Guard] Blocked attempt to mark successfully activated subscription \${strTransId} as failed.\`);
    return existingSub;
  }

  const update = {
    $set: {
      paymentResponse: paymentData,
      paymentsStatus: false,
      userId,
      status: 5,
    },
    $push: { logs: { paymentFailed: new Date() } },
  };

  let updated = await SubscriptionTransaction.findOneAndUpdate(
    { initTransId: strTransId, status: { $ne: 1 } },
    update,
    { new: true }
  ).sort({ createdAt: -1 });

  if (!updated) {
    updated = await Transaction.findOneAndUpdate(
      { initTransId: strTransId, status: { $ne: 1 }, commitStatus: { $ne: true } },
      update,
      { new: true }
    ).sort({ createdAt: -1 });
  }

  return updated;
};`;

function normalize(s) {
  return s.replace(/\r\n/g, '\n');
}

rrpContent = normalize(rrpContent);

if (!rrpContent.includes(normalize(targetA))) console.error("Target A not found");
else rrpContent = rrpContent.replace(normalize(targetA), normalize(replA));

if (!rrpContent.includes(normalize(targetB))) console.error("Target B not found");
else rrpContent = rrpContent.replace(normalize(targetB), normalize(replB));

if (!rrpContent.includes(normalize(targetB2))) console.error("Target B2 not found");
else rrpContent = rrpContent.replace(normalize(targetB2), normalize(replB2));

if (!rrpContent.includes(normalize(targetC))) console.error("Target C not found");
else rrpContent = rrpContent.replace(normalize(targetC), normalize(replC));

if (!rrpContent.includes(normalize(targetD))) console.error("Target D not found");
else rrpContent = rrpContent.replace(normalize(targetD), normalize(replD));

fs.writeFileSync(rrpPath, rrpContent, 'utf8');
console.log("Updated RazorpayResponseHandler.js successfully.");

// 2. Update RazorpayRequestHandler.js (refundRazorpay fallback and logs)
const rrqPath = path.join(backendDir, 'src/services/razorpay/RazorpayRequestHandler.js');
let rrqContent = normalize(fs.readFileSync(rrqPath, 'utf8'));

const targetRRQ = `export const refundRazorpay = async (paymentId, amount, initTransId) => {
  try {
    const refund = await razorpayInstance.payments.refund(paymentId, {
      amount: Math.round(amount * 100), // convert ₹ to paise
    });

    if (refund && refund.id) {
      await Transaction.findOneAndUpdate(
        { initTransId },
        {
          $set: {
            status: 3, // Refunded
            refundResponse: refund,
            refundStatus: true,
            autoRefund: true,
          },
        }
      );
      return true;
    }
    return false;
  } catch (error) {
    console.error("Razorpay refund error:", error);
    return false;
  }
};`;

const replRRQ = `export const refundRazorpay = async (paymentId, amount, initTransId) => {
  try {
    let refundPaise = Math.round(Number(amount) * 100);
    if (!refundPaise || isNaN(refundPaise) || refundPaise <= 0) {
      const tx = await Transaction.findOne({ initTransId });
      const fallbackAmount =
        Number(tx?.finalBookingCalculation?.finalAmount) ||
        Number(tx?.paymentResponse?.amount) ||
        0;
      refundPaise = Math.round(fallbackAmount * 100);
    }
    if (!refundPaise || refundPaise <= 0) {
      console.error(
        \`[refundRazorpay] Cannot refund 0 or invalid amount for transId: \${initTransId}\`
      );
      return false;
    }

    const refund = await razorpayInstance.payments.refund(paymentId, {
      amount: refundPaise,
    });

    if (refund && refund.id) {
      await Transaction.findOneAndUpdate(
        { initTransId },
        {
          $set: {
            status: 3, // Refunded
            refundResponse: refund,
            refundStatus: true,
            autoRefund: true,
          },
          $push: { logs: { ticketRefunded: new Date() } },
        }
      );
      createLog({
        transaction_id: initTransId,
        type: "Booking",
        step: {
          success: true,
          logType: "refundResponse",
          message: "Razorpay refund successful",
          refundId: refund.id,
          timestamp: new Date().toISOString(),
        },
      });
      console.log(\`[refundRazorpay] Successfully refunded \${refundPaise / 100} INR for transId: \${initTransId}, refundId: \${refund.id}\`);
      return true;
    }
    return false;
  } catch (error) {
    console.error("Razorpay refund error:", error);
    return false;
  }
};`;

if (!rrqContent.includes(normalize(targetRRQ))) console.error("Target RRQ not found");
else {
  rrqContent = rrqContent.replace(normalize(targetRRQ), normalize(replRRQ));
  fs.writeFileSync(rrqPath, rrqContent, 'utf8');
  console.log("Updated RazorpayRequestHandler.js successfully.");
}

// 3. Update RazorpayCronJob.js
const cronPath = path.join(backendDir, 'src/services/razorpay/RazorpayCronJob.js');
let cronContent = normalize(fs.readFileSync(cronPath, 'utf8'));

const targetCron1 = `  const pending = await Transaction.find({
    paymentFrom: "razorpay",
    // paymentsStatus: { $ne: true },
    status: { $nin: [1, 3, 4, 5] },
    createdAt: { $gte: from, $lte: to },
  });`;

const replCron1 = `  const pending = await Transaction.find({
    paymentFrom: "razorpay",
    // paymentsStatus: { $ne: true },
    status: { $nin: [1, 3, 4, 5] },
    commitStatus: { $ne: true },
    createdAt: { $gte: from, $lte: to },
  });`;

const targetCron2 = `  } else if (order.status === "attempted") {
    const fresh = await Transaction.findOne({ initTransId: transId }).sort({ createdAt: -1 });
    if (!fresh || [1, 3, 4, 5].includes(fresh.status)) return;`;

const replCron2 = `  } else if (order.status === "attempted") {
    const fresh = await Transaction.findOne({ initTransId: transId }).sort({ createdAt: -1 });
    if (!fresh || [1, 3, 4, 5].includes(fresh.status) || fresh.commitStatus === true) return;`;

const targetCron3 = `    if (process.env.VISTA_TICKET_REFUND === "true") {`;
const replCron3 = `    if (process.env.VISTA_TICKET_REFUND !== "false") {`;

if (!cronContent.includes(normalize(targetCron1))) console.error("Target Cron 1 not found");
else cronContent = cronContent.replace(normalize(targetCron1), normalize(replCron1));

if (!cronContent.includes(normalize(targetCron2))) console.error("Target Cron 2 not found");
else cronContent = cronContent.replace(normalize(targetCron2), normalize(replCron2));

if (!cronContent.includes(normalize(targetCron3))) console.error("Target Cron 3 not found");
else cronContent = cronContent.replace(normalize(targetCron3), normalize(replCron3));

fs.writeFileSync(cronPath, cronContent, 'utf8');
console.log("Updated RazorpayCronJob.js successfully.");

// 4. Update CcavResponseHandler.js
const ccavPath = path.join(backendDir, 'src/services/ccavenue/CcavResponseHandler.js');
let ccavContent = normalize(fs.readFileSync(ccavPath, 'utf8'));

const targetCCAV = `export const paymentFailed = async (
  res,
  strTransId,
  paymentData,
  user,
  userId
) => {
  console.log("data for new check", user, userId);
  console.log("strTransId", strTransId);

  const id = user._id;

  // Try to update in SubscriptionTransaction`;

const replCCAV = `export const paymentFailed = async (
  res,
  strTransId,
  paymentData,
  user,
  userId
) => {
  console.log("data for new check", user, userId);
  console.log("strTransId", strTransId);

  // CRITICAL GUARD: Never overwrite an already confirmed transaction
  const existingTx = await Transaction.findOne({ initTransId: strTransId });
  if (existingTx && (existingTx.status === 1 || existingTx.commitStatus === true)) {
    console.warn(\`[CCAvenue Guard] Blocked attempt to mark successfully booked transaction \${strTransId} as failed.\`);
    return res.send(
      \`<script>window.location.replace('\${process.env.FRONTEND_BASE_URL}/confirmation-screen?transId=\${strTransId}')</script>\`
    );
  }

  const id = user._id;

  // Try to update in SubscriptionTransaction`;

if (!ccavContent.includes(normalize(targetCCAV))) console.error("Target CCAV not found");
else {
  ccavContent = ccavContent.replace(normalize(targetCCAV), normalize(replCCAV));
  fs.writeFileSync(ccavPath, ccavContent, 'utf8');
  console.log("Updated CcavResponseHandler.js successfully.");
}

// 5. Update .env to include VISTA_TICKET_REFUND=true
const envPath = path.join(backendDir, '.env');
let envContent = fs.readFileSync(envPath, 'utf8');
if (!envContent.includes('VISTA_TICKET_REFUND')) {
  envContent += '\nVISTA_TICKET_REFUND=true\n';
  fs.writeFileSync(envPath, envContent, 'utf8');
  console.log("Added VISTA_TICKET_REFUND=true to .env");
}
