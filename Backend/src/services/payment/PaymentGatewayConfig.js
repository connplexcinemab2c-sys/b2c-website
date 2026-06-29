/**
 * PAYMENT GATEWAY CONFIGURATION
 *
 * Change ACTIVE_GATEWAY to switch between payment providers.
 * Every other file in the system reads from here — no other code changes needed.
 *
 * Supported values:
 *   'razorpay'  — Razorpay payment gateway
 *   'ccavenue'  — CCAvenue payment gateway
 */

export const ACTIVE_GATEWAY = process.env.ACTIVE_GATEWAY || 'razorpay';
