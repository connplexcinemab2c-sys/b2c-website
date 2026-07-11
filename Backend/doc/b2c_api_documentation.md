# Connplex B2C Website API Documentation

This document contains the complete API specification for the Connplex B2C ticketing website backend. It outlines the endpoints, payloads, response models, error handling schemas, and encryption details required to integrate front-end clients (web/mobile).

---

## 1. Standard Response & Error Envelopes

### 1.1 Success Response Schema (HTTP 200 / 201)
Successful operations return a consistent JSON wrapper with a status code, a response message, and the requested payload in `data`.

```json
{
  "status": 200,
  "message": "Operation completed successfully.",
  "data": {} // Can be a JSON object, an array [...], or true/false
}
```

### 1.2 Client Error Schema (HTTP 400 / 401 / 403 / 404 / 409)
Client-side failures, authentication issues, or conflicts return a `status` corresponding to the HTTP status code, a descriptive string, and an empty array `data`.

```json
{
  "status": 400,
  "message": "Descriptive error message from the server.",
  "data": []
}
```

### 1.3 Server Error Schema (HTTP 500 / 503)
Unexpected system failures, database issues, or integration timeouts return:

```json
{
  "status": 500,
  "message": "Internal server error",
  "data": [
    "Technical error details (e.g., Cannot read properties of null)"
  ]
}
```

---

## 2. Secure Payment Payload Encryption

Certain sensitive payment/checkout endpoints require the client to send a single hex-encoded, XOR-encrypted parameter `id` containing the pipe-separated payment request parameters.

### 2.1 Encryption & Decryption Algorithms
The backend decrypts payloads using a predefined `salt` value. Below is the symmetric Javascript logic for both encrypting (client-side) and decrypting (server-side):

#### Client-Side Encryption (Javascript/Node)
```javascript
function encryptPayment(salt, text) {
  const textToChars = (t) => t.split("").map((c) => c.charCodeAt(0));
  const applySaltToChar = (code) =>
    textToChars(salt).reduce((a, b) => a ^ b, code);
  return text
    .split("")
    .map((c) => c.charCodeAt(0))
    .map(applySaltToChar)
    .map((code) => code.toString(16).padStart(2, "0"))
    .join("");
}
```

#### Server-Side Decryption (Node)
```javascript
export const decryptPayment = (salt, encoded) => {
  const textToChars = (text) => text.split("").map((c) => c.charCodeAt(0));
  const applySaltToChar = (code) =>
    textToChars(salt).reduce((a, b) => a ^ b, code);
  return encoded
    .match(/.{1,2}/g)
    .map((hex) => parseInt(hex, 16))
    .map(applySaltToChar)
    .map((charCode) => String.fromCharCode(charCode))
    .join("");
};
```

---

## 3. User Authentication & Profile Management

### 3.1 Signup / Login (OTP Generation)
Triggers OTP generation. Sends code via Twilio SMS (if mobile) or Email Verification Mailer.
*   **URL**: `/user/login`
*   **Method**: `POST`
*   **Headers**: 
    *   `x-device-type`: Optional (e.g., `web`, `android`, `ios`)
*   **Request Payload**:
```json
{
  "email": "user@example.com", // String. Required if mobileNumber is omitted
  "mobileNumber": "9876543210", // String (10 digits). Required if email is omitted
  "login_type": "locale", // String. 'locale' | 'google' | 'facebook'
  "fcmToken": "optional-firebase-fcm-token" // String. Optional
}
```
*   **Successful Response (201 Created)**:
```json
{
  "status": 201,
  "message": "Your OTP has been sent to your email", // OR "Your OTP has been sent to your phone number"
  "data": {
    "_id": "64b0f7194f4c80b5ca37ef58" // User database ID
  }
}
```
*   **Possible Errors**:
    *   `400 Bad Request`: If input is invalid.
    *   `400 Bad Request`: `"Something went wrong while we proceed your registration"`
    *   `500 Internal Server Error`: SMS or Email gateway down.

### 3.2 Verify OTP
Verifies the generated OTP and returns a JWT session token.
*   **URL**: `/user/verify-otp`
*   **Method**: `POST`
*   **Request Payload**:
```json
{
  "id": "64b0f7194f4c80b5ca37ef58", // String. Required. User DB ID returned from signup/login
  "otp": "123456", // String. Required. 6-digit OTP code
  "email": "user@example.com", // String. Optional, if validating email update
  "mobileNumber": "9876543210", // String. Optional, if validating mobile update
  "flag": 0, // Number. 0 for login verify, 1 for phone/email update verify
  "type": "user" // String. Required
}
```
*   **Successful Response (200 OK)**:
```json
{
  "status": 200,
  "message": "Verification completed",
  "data": {
    "_id": "64b0f7194f4c80b5ca37ef58",
    "name": "Jane Doe",
    "email": "user@example.com",
    "mobileNumber": "9876543210",
    "image": "profile_image_url.png",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...", // JWT Token
    "membershipTitle": "Connplex Elite Member", // Populated if active
    "subscriptionEndDate": "2027-07-11T00:00:00.000Z"
  }
}
```
*   **Possible Errors**:
    *   `400 Bad Request`: `"Invalid OTP"` (OTP doesn't match db record).
    *   `400 Bad Request`: `"OTP expired"` (Exceeded 30-second window).

### 3.3 Get User Information `[Protected]`
*   **URL**: `/user/user-info`
*   **Method**: `GET`
*   **Successful Response (200 OK)**:
```json
{
  "status": 200,
  "message": "User fetched",
  "data": {
    "_id": "64b0f7194f4c80b5ca37ef58",
    "email": "user@example.com",
    "name": "Jane Doe",
    "mobileNumber": "9876543210",
    "profile": "uploads/profile-1234.jpg",
    "totalRewards": 350,
    "login_type": "locale",
    "isAccountVerified": 1
  }
}
```
*   **Possible Errors**:
    *   `400 Bad Request`: `"User not exist"` (if user ID in token cannot be found).
    *   `401 Unauthorized`: `"Token not authorized"` or `"Token expired"`.

### 3.4 Update User Profile `[Protected]`
*   **URL**: `/user/profile-update`
*   **Method**: `POST`
*   **Content-Type**: `multipart/form-data`
*   **Request Payload (Form Data)**:
    *   `name`: "John Doe" (String)
    *   `birthDate`: "1995-10-15" (String)
    *   `gender`: "Male" (String) // "Male" | "Female" | "Other"
    *   `profile`: File (Image upload)
*   **Successful Response (200 OK)**:
```json
{
  "status": 200,
  "message": "Profile updated successfully",
  "data": {
    "name": "John Doe",
    "birthDate": "1995-10-15T00:00:00.000Z",
    "gender": "Male",
    "profile": "uploads/john_doe_profile.jpg"
  }
}
```

### 3.5 Verify Mobile Number `[Protected]`
Initiates OTP sending to verify changing user's mobile number.
*   **URL**: `/user/verify-mobilenumber`
*   **Method**: `POST`
*   **Request Payload**:
```json
{
  "mobileNumber": "9999988888" // String. Must be exactly 10 digits
}
```
*   **Successful Response (200 OK)**:
```json
{
  "status": 200,
  "message": "Your OTP has been sent to your phone number",
  "data": []
}
```
*   **Possible Errors**:
    *   `400 Bad Request`: `"Mobile-number length must be 10 characters long"` (Joi validation).
    *   `400 Bad Request`: `"Mobile number already verified"` (if number already belongs to req.user).
    *   `400 Bad Request`: `"This mobile number is already linked to another account"` (if active user exists with this number).

### 3.6 Verify Email `[Protected]`
Initiates OTP sending to verify changing user's email.
*   **URL**: `/user/verify-email`
*   **Method**: `POST`
*   **Request Payload**:
```json
{
  "email": "newemail@example.com" // String. Must be a valid email format
}
```
*   **Successful Response (200 OK)**:
```json
{
  "status": 200,
  "message": "Your OTP has been sent to your email",
  "data": []
}
```
*   **Possible Errors**:
    *   `400 Bad Request`: `"email must be a valid email"` (Joi validation).
    *   `400 Bad Request`: `"Email already verified"` (if email already belongs to req.user).
    *   `400 Bad Request`: `"This email is in already linked to another account"` (if active user exists with this email).

---

## 4. Cities, Regions & Cinema Directory

### 4.1 Get Cities/Regions
Returns list of active cities/regions mapped with cinema centers.
*   **URL**: `/user/get-region`
*   **Method**: `GET`
*   **Successful Response (200 OK)**:
```json
{
  "status": 200,
  "message": "Region fetched",
  "data": [
    {
      "_id": "64af6c39f1b0a50de3c1d902",
      "regionName": "Ahmedabad",
      "status": "Active",
      "deletedStatus": 0
    }
  ]
}
```

### 4.2 Get Cinemas by Region
*   **URL**: `/user/get-cinema-by-region/:regionId`
*   **Method**: `GET`
*   **Successful Response (200 OK)**:
```json
{
  "status": 200,
  "message": "Cinema fetched successfully",
  "data": [
    {
      "_id": "64af6d52f1b0a50de3c1d9e9",
      "cinemaId": "1001", // Vista cinema code
      "cinemaName": "Connplex Smart Theatre - SG Highway",
      "address": "4th Floor, Alpha Mall, SG Highway",
      "status": "Active"
    }
  ]
}
```

---

## 5. Movies & Showtimes

### 5.1 Get Movie Shows by Cinema
Retrieves list of active show times for a movie at a specific theatre center.
*   **URL**: `/user/movie-shows-by-cinema`
*   **Method**: `POST`
*   **Request Payload**:
```json
{
  "movieId": "64b0a48b4f4c80b5ca37d571", // String. Required
  "cinemaId": "64af6d52f1b0a50de3c1d9e9", // String. Required
  "date": "2026-07-12" // String (YYYY-MM-DD). Required
}
```
*   **Successful Response (200 OK)**:
```json
{
  "status": 200,
  "message": "Movie shows fetched successfully.",
  "data": [
    {
      "_id": "64b12c8a4f4c80b5ca38102a",
      "filmCode": "HO00001928",
      "sessionId": "19402", // Vista Session ID
      "screenName": "Screen 1",
      "showDateTime": "2026-07-12T14:30:00.000Z",
      "soundType": "Dolby 7.1",
      "experienceType": "Smart Recliner"
    }
  ]
}
```

### 5.2 Rate and Review Movie `[Protected]`
*   **URL**: `/user/write-rate-review`
*   **Method**: `POST`
*   **Request Payload**:
```json
{
  "movieId": "64b0a48b4f4c80b5ca37d571", // String. Required
  "rating": 5, // Number (1-5). Required
  "review": "Spectacular sound design and visuals." // String. Required
}
```
*   **Successful Response (200 OK)**:
```json
{
  "status": 200,
  "message": "Your review added successfully ",
  "data": {
    "movieId": "64b0a48b4f4c80b5ca37d571",
    "userId": "64b0f7194f4c80b5ca37ef58",
    "rating": 5,
    "review": "Spectacular sound design and visuals.",
    "_id": "64c8a2b14f4c80b5ca4002fa"
  }
}
```
*   **Possible Errors**:
    *   `400 Bad Request`: `"You have already reviewed this movie"`

---

## 6. Seating & Ticket Booking

### 6.1 Initialize Booking (Start Transaction)
Calls Vista `InitBooking` to obtain a short-lived transaction token.
*   **URL**: `/init-booking/:strCinemaId/:movieId`
*   **Method**: `GET`
*   **Successful Response (200 OK)**:
```json
{
  "status": 200,
  "message": "Transaction id fetched",
  "data": {
    "Status": 1,
    "data": "1001-57492-918A", // Vista Transaction ID (strTransId)
    "initTransId": "1001-57492-918A",
    "bookingSessionId": "64b2a8d34f4c80b5ca39103e"
  }
}
```
*   **Possible Errors**:
    *   `409 Conflict`: `"This movie is no longer available"` (if the movie is inactive in the admin dashboard).
    *   `400 Bad Request`: Vista API unreachable or throws error response status code.

### 6.2 Add Seats (Hold Quantity)
Locks down a seat quantity block in Vista before seat coordinate mapping.
*   **URL**: `/add-seats`
*   **Method**: `POST`
*   **Request Payload**:
```json
{
  "id": "1001|1001-57492-918A|19402|Premium|2", // String. Format: cinemaId|strTransId|strSessId|seatType|quantity
  "showId": "64b12c8a4f4c80b5ca38102a" // String. Required
}
```
*   **Successful Response (200 OK)**:
```json
{
  "status": 200,
  "message": "Seat added",
  "data": {
    "Status": 1,
    "data": "Success"
  }
}
```
*   **Possible Errors**:
    *   `400 Bad Request`: `"These show are no longer available yet. Please try another show"` (if show doesn't exist or is inactive).

### 6.3 Set Seats (Choose Exact Seats)
Assigns held ticket count to exact coordinate seats.
*   **URL**: `/set-seats`
*   **Method**: `POST`
*   **Request Payload**:
```json
{
  "cinemaId": "1001", // String. Required
  "strTransId": "1001-57492-918A", // String. Required
  "lngSessionId": "19402", // String. Required
  "strSelectedSeats": "A1,A2", // String. Comma-separated physical codes. Required
  "movieObjId": "64b0a48b4f4c80b5ca37d571", // String. Required
  "cinemaObjId": "64af6d52f1b0a50de3c1d9e9", // String. Required
  "showObjId": "64b12c8a4f4c80b5ca38102a", // String. Required
  "paymentsBreakup": "{\"ticketTotal\": 600, \"tax\": 30}" // Stringified JSON. Required
}
```
*   **Successful Response (200 OK)**:
```json
{
  "status": 200,
  "message": "Set seat successfully",
  "data": "Success"
}
```
*   **Possible Errors**:
    *   `400 Bad Request`: Vista errors (e.g. seats already taken, layout mismatch).

---

## 7. Food & Beverage Concessions

### 7.1 Add Concessions to Transaction
Links F&B items to the active Vista ticket transaction.
*   **URL**: `/add-conssesion`
*   **Method**: `POST`
*   **Request Payload**:
```json
{
  "cinemaId": "1001", // String. Required
  "strTransId": "1001-57492-918A", // String. Required
  "strItemsOrder": "FNB0012|2", // String. Format: itemId|qty (comma separated if multiple). Required
  "itemData": "{\"items\": [{\"id\":\"FNB0012\",\"qty\":2,\"price\":250}]}" // Stringified JSON. Required
}
```
*   **Successful Response (200 OK)**:
```json
{
  "status": 200,
  "message": "Concession added in booking",
  "data": {
    "Status": 1,
    "data": "Success"
  }
}
```

---

## 8. Coupon Codes & Validation

### 8.1 Validate Ticket Booking Coupon `[Protected]`
*   **URL**: `/user/validate-coupon`
*   **Method**: `POST`
*   **Request Payload**:
```json
{
  "couponTitle": "WINTER50", // String. Required
  "cityId": "64af6c39f1b0a50de3c1d902", // String. Required
  "cinemaObjectId": "64af6d52f1b0a50de3c1d9e9", // String. Required
  "movieLanguage": "English", // String. Required
  "userSpentAmount": 500, // Number. Required
  "couponType": "Cinema" // String. 'Cinema' | 'F&B' | 'Ecommerce' | 'Subscription'
}
```
*   **Successful Response (200 OK)**:
```json
{
  "status": 200,
  "message": "Coupons valid!",
  "data": {
    "_id": "64c8d9e24f4c80b5ca401928",
    "couponTitle": "WINTER50",
    "discountValue": 50,
    "discountType": "Percentage"
  }
}
```
*   **Possible Errors**:
    *   `404 Not Found`: `"Coupon not valid!"` (No active matching coupon found).
    *   `403 Forbidden`: `"Coupon usage limit exceeded for this user"` (User exceeded their usage limit).
    *   `403 Forbidden`: `"Coupon code usage limit exceeded overall"` (Overall code limit reached).

---

## 9. Loyalty Rewards & Memberships

### 9.1 Redeem Reward Coins `[Protected]`
Redeems coins from the user's loyalty rewards balance.
*   **URL**: `/user/redeem-coins`
*   **Method**: `POST`
*   **Request Payload**:
```json
{
  "coinsToRedeem": 100 // Number. Required
}
```
*   **Successful Response (200 OK)**:
```json
{
  "status": 200,
  "message": "Coins redeemed successfully.",
  "data": {
    "redeemedCoins": 100,
    "discountAmount": 10 // conversion mapping details
  }
}
```
*   **Possible Errors**:
    *   `400 Bad Request`: `"Insufficient coin balance."`
    *   `400 Bad Request`: `"Redemption amount exceeds the maximum cap."`

---

## 10. Payment Gateways & Checkout

### 10.1 Ticket Payment Request (Initiate Order)
*   **URL**: `/user/ccavRequestHandler`
*   **Method**: `POST`
*   **Request Payload**:
```json
{
  "id": "4e183b0f560e227e5a071c..." // String. Hex-encoded XOR encrypted string. Required
}
```
> **Note**: Decrypted string parameters must follow this exact schema:
> `transId | cinemaId | sessionId | userId | areaCatCode | quantity | pGroupCode | fAndB | appliedRewardPoints | booking_type`

#### Successful Razorpay Response (200 OK)
```json
{
  "status": 200,
  "message": "Order created successfully",
  "data": {
    "razorpayOrderId": "order_NX83jdf920fD",
    "amount": 35000, // paise (₹350.00)
    "currency": "INR",
    "keyId": "rzp_live_19280df0a",
    "transId": "1001-57492-918A",
    "cinemaId": "64af6d52f1b0a50de3c1d9e9",
    "sessionId": "19402",
    "userId": "64b0f7194f4c80b5ca37ef58",
    "prefill": {
      "name": "Jane Doe",
      "email": "user@example.com",
      "contact": "9876543210"
    }
  }
}
```
#### Possible Errors:
*   `400 Bad Request`: `"Booking session expired!"` (exceeded 10-minute hold window).
*   `404 Not Found`: `"Booking details mismatched"` (amount, seats, show details modified since initialization).
*   `503 Service Unavailable`: `"Booking is disable for sometime."` (Admin toggled booking off).

---

### 10.2 Verify Ticket Payment & Commit Booking
*   **URL**: `/user/ccavResponseHandler`
*   **Method**: `POST`
*   **Request Payload (Razorpay)**:
```json
{
  "paymentStatus": "success", // String. 'success' | 'failed' | 'cancelled'
  "razorpay_payment_id": "pay_NX8dfj281df", // String. Required for success
  "razorpay_order_id": "order_NX83jdf920fD", // String. Required for success
  "razorpay_signature": "ab83df02a0df8b28ef8...", // String. Required for success
  "transId": "1001-57492-918A", // String. Required
  "cinemaId": "64af6d52f1b0a50de3c1d9e9", // String. Required
  "sessionId": "19402", // String. Required
  "userId": "64b0f7194f4c80b5ca37ef58" // String. Required
}
```

#### Success Response
If both signature verification and Vista Commit pass successfully, it returns a 200 redirect payload:
```json
{
  "redirectUrl": "https://ticketing.theconnplex.com/confirmation-screen"
}
```

#### Failure Responses & Redirects
*   **Razorpay Signature Verification Fails**:
    *   Returns status `400` with redirectUrl: `https://ticketing.theconnplex.com/transaction-failed`.
*   **Session hold period exceeded (> 10 minutes) before callback**:
    *   Returns status `400` with redirectUrl: `https://ticketing.theconnplex.com/transaction-failed`.
*   **Vista Commit fails (`Status != 1`)**:
    *   Triggers automatic refund sequence via Razorpay.
    *   Returns status `200` with redirectUrl: `https://ticketing.theconnplex.com/transaction-failed`.

---

## 11. Lead Capture & Contact Endpoints

### 11.1 Contact Us Form
*   **URL**: `/user/contact-us`
*   **Method**: `POST`
*   **Request Payload**:
```json
{
  "firstName": "John", // String. Required
  "lastName": "Smith", // String. Required
  "email": "john.smith@example.com", // String. Required
  "mobileNumber": "9898989898", // String (10 digits). Required
  "message": "Interested in booking Screen 2 for a private birthday party." // String. Required
}
```
*   **Successful Response (200 OK)**:
```json
{
  "status": 200,
  "message": "Your request has been sent successfully. We will contact you soon",
  "data": []
}
```

### 11.2 Career Application
*   **URL**: `/submit-career`
*   **Method**: `POST`
*   **Content-Type**: `multipart/form-data`
*   **Request Payload (Form Data)**:
    *   `firstName`: "Amit" (String)
    *   `lastName`: "Shah" (String)
    *   `email`: "amit.shah@example.com" (String)
    *   `mobileNumber`: "8888877777" (String)
    *   `position`: "Theatre Manager" (String)
    *   `resume`: File (PDF/Doc file upload)
*   **Successful Response (200 OK)**:
```json
{
  "status": 200,
  "message": "Your career request has been sent",
  "data": []
}
```
