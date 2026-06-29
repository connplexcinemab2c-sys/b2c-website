/**
 * PAYMENT HANDLER — Unified gateway abstraction
 *
 * All route files import payment functions from HERE, never directly from
 * a specific gateway folder.  To switch gateways, change ACTIVE_GATEWAY
 * in PaymentGatewayConfig.js — nothing else needs to change.
 */
import { ACTIVE_GATEWAY } from "./PaymentGatewayConfig.js";

let paymentRequest;
let paymentResponse;
let subscriptionPaymentRequest;
let subscriptionPaymentResponse;
let refundPayment;
let razorpayWebhook; // Razorpay-only; registered conditionally in routes

if (ACTIVE_GATEWAY === "razorpay") {
  const reqHandler = await import("../razorpay/RazorpayRequestHandler.js");
  const resHandler = await import("../razorpay/RazorpayResponseHandler.js");

  paymentRequest = reqHandler.paymentRequest;
  paymentResponse = resHandler.paymentResponse;
  subscriptionPaymentRequest = reqHandler.subscriptionPaymentRequest;
  subscriptionPaymentResponse = resHandler.subscriptionPaymentResponse;
  refundPayment = reqHandler.refundRazorpay;
  razorpayWebhook = resHandler.razorpayWebhook;
} else {
  // ACTIVE_GATEWAY === 'ccavenue'
  const reqHandler = await import("../ccavenue/CcavRequestHandler.js");
  const resHandler = await import("../ccavenue/CcavResponseHandler.js");

  paymentRequest = reqHandler.paymentRequest;
  paymentResponse = resHandler.paymentResponse;
  subscriptionPaymentRequest = reqHandler.subscriptionPaymentRequest;
  subscriptionPaymentResponse = resHandler.subscriptionPaymentResponse;
  refundPayment = reqHandler.refundCcavenue;
  razorpayWebhook = null;
}

export {
  paymentRequest,
  paymentResponse,
  subscriptionPaymentRequest,
  subscriptionPaymentResponse,
  refundPayment,
  razorpayWebhook,
};
