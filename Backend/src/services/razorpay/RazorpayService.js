import Razorpay from "razorpay";
import { createHmac } from "node:crypto";

/**
 * Razorpay SDK instance — uses credentials from environment variables.
 *
 * Required env vars:
 *   RAZORPAY_KEY_ID      — from Razorpay dashboard (Settings → API Keys)
 *   RAZORPAY_KEY_SECRET  — from Razorpay dashboard
 */
export const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_SbglAryI95exjE",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "L101VDZxAurq6qjBSFnqOzsE",
});



/**
 * Verify Razorpay payment signature (HMAC-SHA256).
 *
 * Razorpay signs: razorpay_order_id + "|" + razorpay_payment_id
 * using the key secret. Frontend sends all three fields; backend verifies.
 *
 * @param {string} orderId     - razorpay_order_id from frontend
 * @param {string} paymentId   - razorpay_payment_id from frontend
 * @param {string} signature   - razorpay_signature from frontend
 * @returns {boolean}
 */
export const verifyPaymentSignature = (orderId, paymentId, signature) => {
  const body = `${orderId}|${paymentId}`;
  const expectedSignature = createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest("hex");
  return expectedSignature === signature;
};

/**
 * Verify Razorpay webhook signature.
 *
 * Required env var: RAZORPAY_WEBHOOK_SECRET
 *
 * @param {string} rawBody   - raw request body string
 * @param {string} signature - x-razorpay-signature header value
 * @returns {boolean}
 */
export const verifyWebhookSignature = (rawBody, signature) => {
  const expectedSignature = createHmac(
    "sha256",
    process.env.RAZORPAY_WEBHOOK_SECRET
  )
    .update(rawBody)
    .digest("hex");
  return expectedSignature === signature;
};
