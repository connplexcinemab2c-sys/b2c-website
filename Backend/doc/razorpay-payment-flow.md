# Razorpay Payment Flow

## Overview

Razorpay is used as a payment gateway for both **ticket booking** and **subscription membership** purchases. The flow is implemented in:

| File | Purpose |
|------|---------|
| `src/services/razorpay/RazorpayRequestHandler.js` | Initiate payment — create Razorpay order |
| `src/services/razorpay/RazorpayResponseHandler.js` | Verify payment — commit Vista booking / activate subscription |
| `src/services/razorpay/RazorpayService.js` | Razorpay SDK instance, HMAC signature helpers |
| `src/services/payment/PaymentGatewayConfig.js` | `ACTIVE_GATEWAY` switch — set to `"razorpay"` to activate |
| `src/services/payment/PaymentHandler.js` | Facade re-export — routes import from here only |

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `RAZORPAY_KEY_ID` | Public key from Razorpay Dashboard → Settings → API Keys |
| `RAZORPAY_KEY_SECRET` | Secret key (used for HMAC signature verification) |
| `RAZORPAY_WEBHOOK_SECRET` | Webhook secret (set in Razorpay Dashboard → Webhooks) |
| `RAZORPAY_PAYMENT_MODE` | `"test"` charges ₹1 / 1 paise; production charges full amount |
| `ENABLE_BOOKING` | `"false"` disables booking entirely (returns 503) |
| `VISTA_TICKET_BOOKING` | `"true"` enables Vista CommitBookingEx call |
| `VISTA_TICKET_REFUND` | `"true"` auto-refunds via Razorpay if Vista commit fails |
| `FRONTEND_BASE_URL` | Base URL used in redirect responses |
| `VISTA_URL_BOOKING_URL` | Vista internal API base URL |
| `M_TICKET_URL` | Mobile ticket URL prefix (SMS / email link) |
| `SEND2DIGITAL_TICKET_BOOKING_CONTENTID` | SMS template ID for booking confirmation |
| `SEND2DIGITAL_FAILED_TRANSACTION_CONTENTID` | SMS template ID for failed transaction |
| `salt` | AES salt used to decrypt the encrypted `id` payload from frontend |

---

## Routes

```
POST  /api/user/ccavRequestHandler          → paymentRequest       (ticket booking)
POST  /api/user/ccavResponseHandler         → paymentResponse      (ticket booking)
POST  /api/user/subscription-ccavRequestHandler  → subscriptionPaymentRequest
POST  /api/user/subscription-ccavResponseHandler → subscriptionPaymentResponse
POST  /api/user/razorpay-webhook            → razorpayWebhook      (optional async events)
```

---

## Transaction Status Values

| Status | Meaning | Set When |
|--------|---------|----------|
| `4` | Payment received from Razorpay | HMAC signature verified |
| `1` | Ticket fully booked | Vista `CommitBookingEx` returned `Status == 1` |
| `3` | Auto-refunded | Vista failed + `VISTA_TICKET_REFUND=true` |
| `5` | Payment failed / cancelled / session expired | Any failure path |
| `7` | Ticket cancelled | `cancelTicket` controller |

---

## Transaction.logs Array Entries

Each entry is pushed into the `logs` array on the `Transaction` document.

| Log Entry | Written When |
|-----------|-------------|
| `{ proceedToPay: Date }` | User submits payment — `paymentRequest` called |
| `{ paymentSuccess: Date }` | HMAC verified, payment stored as status 4 |
| `{ ticketBooked: Date }` | Vista commit success — status updated to 1 |
| `{ ticketFailed: Date }` | Vista commit failed — commitStatus: false |
| `{ paymentFailed: Date }` | Payment failed OR session expired after payment |

---

## Logs Collection (createLog entries)

Separate `Logs` collection entries written throughout the flow.

| `logType` | `success` | Message | Written When |
|-----------|-----------|---------|-------------|
| `paymentStarted` | `true` | Payment Started | Razorpay order created successfully |
| `paymentStarted` | `false` | Payment Details Mismatch | Booking validation failed |
| `paymentResponse` | `false` | Payment failed / cancelled | paymentStatus !== "success" |
| `paymentResponse` | `false` | Razorpay signature verification failed | HMAC check fails |
| `paymentResponse` | `true` | Payment Successful, Commit Booking Started | HMAC verified |
| `vistaBookingResponse` | `false` | Ticket Booking Failed — Booking time exceeded 10 minutes | Session expired |
| `vistaBookingResponse` | `true` | Ticket Booked Successfully | Vista Status == 1 |
| `vistaBookingResponse` | `false` | Ticket Booking Failed | Vista Status != 1 or network error |

---

## Ticket Booking — Full Step-by-Step Flow

### Phase 1 — `paymentRequest`  (POST `/ccavRequestHandler`)

```
Frontend  →  POST { id: "<encrypted payload>" }
```

**1. Booking disabled check**
- If `ENABLE_BOOKING === "false"` → `503 SERVICE_UNAVAILABLE`

**2. Decrypt payload**
- AES-decrypt `id` using `process.env.salt`
- Extracts: `transId | cinemaId | sessionId | userId | areaCatCode | quantity | pGroupCode | fAndB | booking_type`

**3. Session expiry check**  
- Load `Transaction` by `initTransId`
- Read `logs[0].initBooking` timestamp
- If `now - initBooking > 10 minutes` → `400 BOOKING_SESSION_EXPIRED`

**4. Mark proceeding to payment**
```
Transaction.$set  { userId, paymentFrom: "razorpay", booking_type }
Transaction.$push { logs: { proceedToPay: Date } }
```

**5. Validate booking details**
- Load `Transaction` (populated)
- Check seat quantity matches
- Check F&B flag matches
- Check `areaCatCode` exists in `Price` or `PricePackage`
- If any mismatch → `400 BOOKING_DETAILS_MISMATCH`

**6. Check amount**
- `finalAmount` from `Transaction.finalBookingCalculation.finalAmount`
- If `finalAmount <= 0` → `400 BOOKING_DETAILS_MISMATCH`

**7. Create Razorpay order**
```js
razorpayInstance.orders.create({
  amount  : finalAmount * 100,   // paise (₹1 in test mode = 100 paise)
  currency: "INR",
  receipt : transId,
  notes   : { transId, cinemaId, sessionId, userId }
})
```

**8. createLog** — `logType:"paymentStarted"`, `success:true`

**9. Response to frontend**
```json
{
  "status": 200,
  "message": "Order created successfully",
  "data": {
    "razorpayOrderId": "order_xxxx",
    "amount": 50000,
    "currency": "INR",
    "keyId": "rzp_live_xxx",
    "transId": "...",
    "cinemaId": "...",
    "sessionId": "...",
    "userId": "...",
    "prefill": { "name": "...", "email": "...", "contact": "+91..." }
  }
}
```

**Frontend** opens Razorpay popup with this data. User completes payment. Razorpay closes popup and returns `razorpay_payment_id`, `razorpay_order_id`, `razorpay_signature` to frontend.

---

### Phase 2 — `paymentResponse`  (POST `/ccavResponseHandler`)

```
Frontend  →  POST {
  paymentStatus,
  razorpay_payment_id,
  razorpay_order_id,
  razorpay_signature,
  transId, cinemaId, sessionId, userId
}
```

#### Path A — Payment Failed or Cancelled

```
paymentStatus = "failed" | "cancelled"
```

Frontend may also forward `razorpay_payment_id`, `razorpay_order_id`, and a Razorpay `error` object — all are stored.

| Step | Action | DB Write |
|------|--------|----------|
| 1 | Build `failedPaymentData` — `{ order_status, razorpay_payment_id?, razorpay_order_id?, error? }` | — |
| 2 | createLog `paymentResponse` failed with full error object | — |
| 3 | `_handlePaymentFailedDb` | Transaction or SubscriptionTransaction: `paymentResponse: failedPaymentData`, `status:5`, `paymentsStatus:false`, `$push logs.paymentFailed` |
| 4 | Send email + SMS (skipped if `cancelled`) | — |
| 5 | Return `{ redirectUrl: /transaction-failed }` | — |

---

#### Path B — Signature Invalid

| Step | Action | DB Write |
|------|--------|----------|
| 1 | HMAC check fails | — |
| 2 | createLog `paymentResponse` signature failed | — |
| 3 | `_handlePaymentFailedDb` | Transaction: `paymentResponse: { order_status:"SignatureFailed", razorpay_payment_id, razorpay_order_id, razorpay_signature }`, `status:5`, `paymentsStatus:false`, `$push logs.paymentFailed` |
| 4 | Return `400` `{ redirectUrl: /transaction-failed }` | — |

---

#### Path C — Payment Successful

```
paymentStatus = "success"  AND  HMAC signature valid
```

| Step | Action | DB Write |
|------|--------|----------|
| 1 | createLog `paymentResponse` success | — |
| 2 | Load `bookingData` from Transaction | — |
| 3 | Collect couponIds from `ticketCart.coupons` + `foodCart.coupons` | — |
| 4 | Calculate session window: `bookingStartTime` vs `Transaction.createdAt + 10 min` | — |
| **5** | **Store payment** | `Transaction.$set { paymentResponse:{ razorpay_payment_id, razorpay_order_id, razorpay_signature, order_status:"Success", amount }, paymentsStatus:true, userId, couponId:[...], status:4, discountCouponStatus:true }` |
| | | `Transaction.$push { logs: { paymentSuccess: Date } }` |
| 6 | `calculateAndSaveCoins(transId)` — fire-and-forget | Coins DB update |

---

#### Path C1 — Session Expired (10 min exceeded)

| Step | Action | DB Write |
|------|--------|----------|
| 1 | createLog `vistaBookingResponse` — session expired | — |
| 2 | `_handlePaymentFailedDb` | Transaction: `status:5`, `$push logs.paymentFailed` |
| 3 | Return `{ redirectUrl: /transaction-failed }` | — |

---

#### Path C2 — Session Valid → Vista Booking

| Step | Action | DB Write |
|------|--------|----------|
| 1 | `checkAndGrantWelcomeGift(userId)` — awaited | `SubscriptionWelcomeGift` if threshold met |
| 2 | If `VISTA_TICKET_BOOKING !== "true"` → bypass | Return `{ redirectUrl: /confirmation-screen }` |
| 3 | Build `CommitBookingEx` URL with `cinemaId`, `transId`, `sessionId`, `name`, `mobileNo`, `multipayment` | — |
| 4 | Call Vista API | — |

**Vista Success (`Status == 1`)**

| Step | Action | DB Write |
|------|--------|----------|
| 1 | createLog `vistaBookingResponse` success | — |
| 2 | `_handleBookingSuccess` | `Transaction.$set { commitBookingData:vista.data.data, status:1, commitStatus:true, discountCouponStatus:true }` |
| | | `Transaction.$push { logs: { ticketBooked: Date } }` |
| | | `CCAvenueSMSMail` new record |
| | | `Notification` new record |
| 3 | Send `bookingSuccess` email | — |
| 4 | Send `smsSend2Digital` SMS | — |
| 5 | `userNotification` | — |
| 6 | Return `{ redirectUrl: /confirmation-screen }` | — |

**Vista Failed (non-success `Status` or network error)**

| Step | Action | DB Write |
|------|--------|----------|
| 1 | createLog `vistaBookingResponse` failed | — |
| 2 | If `VISTA_TICKET_REFUND=true` → `refundRazorpay` | `Transaction.$set { status:3, refundResponse, refundStatus:true, autoRefund:true }` |
| 3 | `_handleTicketFailed` | `Transaction.$set { commitBookingData:null, commitStatus:false, vistaErrorResponse }` |
| | | `Transaction.$push { logs: { ticketFailed: Date } }` |
| 4 | Send `BookingFailed` email | — |
| 5 | Return `{ redirectUrl: /transaction-failed }` | — |

---

## Subscription Payment — Full Step-by-Step Flow

### Phase 1 — `subscriptionPaymentRequest`  (POST `/subscription-ccavRequestHandler`)

**1. Validate user** — from `req.user` (JWT middleware)

**2. Check duplicate subscription** — if active membership exists for same plan → `409 CONFLICT`

**3. Calculate amount**
- Base price: `isDiscounted ? discountedPrice : price`
- Apply coupon via `verifyMembershipCoupon` if `couponCode` provided

**4. Free subscription (amount ≤ 0)**
```
SubscriptionTransaction.create { status:1, paymentFrom:"razorpay", payment_mode:"Voucher" }
activateSubscriptionMembership()
Return { redirectUrl: /membership-success }
```

**5. Create pending transaction**
```
SubscriptionTransaction.create { userId, paymentFrom:"razorpay", subscriptionId, initTransId:transId }
```

**6. Create Razorpay order**
- `amount`: 1 paise in test mode, `amount * 100` in production

**7. Return JSON to frontend**
```json
{
  "razorpayOrderId": "order_xxx",
  "amount": 1,
  "keyId": "rzp_live_xxx",
  "transId": "...",
  "subscriptionId": "...",
  "couponCode": "...",
  "totalDiscount": 0,
  "prefill": { ... }
}
```

---

### Phase 2 — `subscriptionPaymentResponse`  (POST `/subscription-ccavResponseHandler`)

**Payment Failed**
```
SubscriptionTransaction.$set { status:5, paymentsStatus:false }
Send SMS
Return { redirectUrl: /membership-failed }
```

**Signature Invalid**
```
Return 400 { redirectUrl: /membership-failed }
```

**Payment Successful**

| Step | Action | DB Write |
|------|--------|----------|
| 1 | Verify HMAC signature | — |
| 2 | Load `SubscriptionTransaction` | — |
| 3 | Update transaction | `SubscriptionTransaction.$set { status:1, paymentResponse, paymentsStatus:true, coupon }` |
| 4 | `activateSubscriptionMembership` | `SubscriberMembership.updateMany { isActive:false }` (deactivate old) |
| | | `SubscriptionMembership.findOneAndUpdate` upsert with full plan snapshot |
| | | `SubscriptionWelcomeGift` created if `welcomeGift === "Yes"` |
| 5 | Return `{ redirectUrl: /membership-success }` | — |

---

## multipayment Parameter (Vista)

Vista requires a `MultiPaymentDetails` string to split ticket vs F&B amounts:

```
|PAYTYPE1=CW|AMOUNT1=<ticketTotal_paise>|PAYTYPE2=CWFNB|AMOUNT2=<fnbTotal>|
```

- `ticketTotal` = `finalBookingCalculation.ticketCart.ticketTotal * 100`
- `fnbTotal` = `finalBookingCalculation.foodCart.totalAmountByBase`
- `PAYTYPE2` block is only appended when `fnbTotal > 0`

---

## checkAndGrantWelcomeGift

Called (with `await`) inside the session-valid block of `paymentResponse`, before the Vista call.

```
Read  GeneralSetting.isWelcomeGift
Read  GeneralSetting.ticketsRequired
Count Transaction where userId = userId AND paymentResponse != null
If count >= ticketsRequired AND no existing gift with type:"ticket":
  Create SubscriptionWelcomeGift { userId, collectBeforeDate: today+30days, type:"ticket" }
```

---

## Razorpay Webhook  (POST `/razorpay-webhook`)

Optional. Register the URL in Razorpay Dashboard → Webhooks.

- Verifies `x-razorpay-signature` header using `RAZORPAY_WEBHOOK_SECRET`
- On `payment.captured` event: sets `Transaction.paymentResponse.webhook_captured = true`
- Returns `{ status: "ok" }`

---

## Signature Verification Logic

```
HMAC-SHA256( razorpay_order_id + "|" + razorpay_payment_id , RAZORPAY_KEY_SECRET )
  must equal
razorpay_signature  (sent by frontend)
```

Implemented in `RazorpayService.js → verifyPaymentSignature()`.

---

## Key Design Decisions

| Decision | Reason |
|----------|--------|
| Status 4 stored BEFORE session check | Payment is confirmed from Razorpay side regardless of Vista; money is received |
| Session check uses `Transaction.createdAt + 10 min` | Matches CCAvenue response handler logic |
| `calculateAndSaveCoins` is fire-and-forget | Must not block the Vista commit or the response |
| `checkAndGrantWelcomeGift` is awaited | Ensures the gift is saved before Vista is called (matches CCAvenue behavior) |
| Vista call uses `.then/.catch` pattern | Matches CCAvenue implementation pattern exactly |
| Vista non-success (`Status != 1`) handled explicitly | CCAvenue had no handler for this case; fixed in Razorpay |
| Refund only on Vista failure, not session expiry | Session expiry refund requires manual admin action |
