import fs from 'fs';
import path from 'path';

const backendDir = 'c:/Users/admin/Downloads/Connplex-B2C/Backend';

// 1. RazorpayResponseHandler.js
const rrpPath = path.join(backendDir, 'src/services/razorpay/RazorpayResponseHandler.js');
let rrpContent = fs.readFileSync(rrpPath, 'utf8').replace(/\r\n/g, '\n');

const retryFn = `/**
 * Helper to call Vista CommitBookingEx with automatic retry on transient failures.
 */
export const callVistaCommitWithRetry = async (vistaConfig, retries = 2, delayMs = 1000) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await axios.request({ ...vistaConfig, timeout: 20000 });
      if (response?.data?.Status == 1) {
        return response;
      }
      const dataStr = JSON.stringify(response?.data || "");
      // Do not retry definitive business errors (e.g. seats already sold / contiguous error)
      if (dataStr.includes("contiguous") || dataStr.includes("not available")) {
        return response;
      }
      if (attempt < retries) {
        console.warn(\`[VistaRetry] Attempt \${attempt} returned non-success, retrying in \${delayMs}ms...\`);
        await new Promise((r) => setTimeout(r, delayMs));
        continue;
      }
      return response;
    } catch (err) {
      if (attempt < retries) {
        console.warn(\`[VistaRetry] Network error on attempt \${attempt} (\${err.message}), retrying in \${delayMs}ms...\`);
        await new Promise((r) => setTimeout(r, delayMs));
      } else {
        throw err;
      }
    }
  }
};
`;

// Insert retryFn before paymentResponse
const targetPaymentResponse = 'export const paymentResponse = async (req, res) => {';
if (!rrpContent.includes('export const callVistaCommitWithRetry')) {
  rrpContent = rrpContent.replace(targetPaymentResponse, `${retryFn}\n${targetPaymentResponse}`);
}

// Replace axios.request(vistaConfig) with callVistaCommitWithRetry(vistaConfig, 2, 1000)
const targetAxios = `    try {
      axios
        .request(vistaConfig)`;

const replAxios = `    try {
      callVistaCommitWithRetry(vistaConfig, 2, 1000)`;

if (rrpContent.includes(targetAxios)) {
  rrpContent = rrpContent.replace(targetAxios, replAxios);
} else {
  console.log("targetAxios not directly matched, checking alternate formatting");
}

fs.writeFileSync(rrpPath, rrpContent, 'utf8');
console.log("Updated RazorpayResponseHandler.js with callVistaCommitWithRetry.");

// 2. RazorpayCronJob.js
const cronPath = path.join(backendDir, 'src/services/razorpay/RazorpayCronJob.js');
let cronContent = fs.readFileSync(cronPath, 'utf8').replace(/\r\n/g, '\n');

// Import callVistaCommitWithRetry
const targetImport = `  _handleBookingSuccess,
} from "./RazorpayResponseHandler.js";`;

const replImport = `  _handleBookingSuccess,
  callVistaCommitWithRetry,
} from "./RazorpayResponseHandler.js";`;

if (cronContent.includes(targetImport) && !cronContent.includes('callVistaCommitWithRetry,')) {
  cronContent = cronContent.replace(targetImport, replImport);
}

// Replace axios in _commitTicketBooking
const targetCronAxios = `    const response = await axios.request({
      method: "get",
      maxBodyLength: Infinity,
      url:
        \`\${process.env.VISTA_URL_BOOKING_URL}/CommitBookingEx\` +
        \`?strCinemaId=\${cinemaId}\` +
        \`&strTransId=\${transId}\` +
        \`&lngSessId=\${sessionId}\` +
        \`&Name=\${name}\` +
        \`&MobileNo=\${user.mobileNumber}\` +
        \`&MultiPaymentDetails=\${multipayment}\`,
      headers: {},
    });`;

const replCronAxios = `    const response = await callVistaCommitWithRetry(
      {
        method: "get",
        maxBodyLength: Infinity,
        url:
          \`\${process.env.VISTA_URL_BOOKING_URL}/CommitBookingEx\` +
          \`?strCinemaId=\${cinemaId}\` +
          \`&strTransId=\${transId}\` +
          \`&lngSessId=\${sessionId}\` +
          \`&Name=\${name}\` +
          \`&MobileNo=\${user.mobileNumber}\` +
          \`&MultiPaymentDetails=\${multipayment}\`,
        headers: {},
      },
      2,
      1000
    );`;

if (cronContent.includes(targetCronAxios)) {
  cronContent = cronContent.replace(targetCronAxios, replCronAxios);
}

fs.writeFileSync(cronPath, cronContent, 'utf8');
console.log("Updated RazorpayCronJob.js with callVistaCommitWithRetry.");
