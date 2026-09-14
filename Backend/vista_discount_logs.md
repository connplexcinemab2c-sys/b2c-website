# Vista Discount & Booking Logs Report

Generated at: 2026-09-11T10:45:16.413Z

This report shows recent live transactions where a discount was applied on the website, the failure of `updateVistaOrderPrice`, and what Vista DB actually committed.

| Transaction ID | Time (UTC) | Gross Ticket | Discount | Discounted Total | `updateVistaOrderPrice` Status | Vista DB Committed Amount |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `20000052377` | 2026-09-11 10:19:50 | ₹740 | -₹37 | ₹703 | ❌ Failed (Not applied in Vista) | **N/A** |
| `20000187215` | 2026-09-11 10:14:23 | ₹400 | -₹20 | ₹380 | ❌ Failed (Not applied in Vista) | **N/A** |
| `20000052360` | 2026-09-11 10:09:06 | ₹450 | -₹22.5 | ₹427.5 | ❌ Failed (Not applied in Vista) | **N/A** |
| `20000148880` | 2026-09-11 10:06:17 | ₹600 | -₹10 | ₹590 | ❌ Failed (Not applied in Vista) | **₹600 (Full Price!)** |
| `20000148876` | 2026-09-11 10:04:43 | ₹600 | -₹10 | ₹590 | ❌ Failed (Not applied in Vista) | **N/A** |
| `20000052348` | 2026-09-11 10:04:05 | ₹1600 | -₹80 | ₹1520 | ❌ Failed (Not applied in Vista) | **₹1600 (Full Price!)** |
| `20000052329` | 2026-09-11 09:50:05 | ₹1800 | -₹90 | ₹1710 | ❌ Failed (Not applied in Vista) | **N/A** |
| `20000052325` | 2026-09-11 09:47:04 | ₹1800 | -₹90 | ₹1710 | ❌ Failed (Not applied in Vista) | **N/A** |
| `20000223124` | 2026-09-11 09:46:49 | ₹1750 | -₹87.5 | ₹1662.5 | ❌ Failed (Not applied in Vista) | **₹1750 (Full Price!)** |
| `20000084354` | 2026-09-11 09:44:55 | ₹400 | -₹20 | ₹380 | ❌ Failed (Not applied in Vista) | **N/A** |

---

## Detailed Log JSON for Each Transaction

### Transaction: `20000052377`
```json
{
  "transaction_id": "20000052377",
  "timestamp": "2026-09-11T10:19:50.943Z",
  "cinemaId": "66dec4a732f80e5ccda94c13",
  "grossTicketPrice": 740,
  "discountApplied": 37,
  "discountedTicketTotal": 703,
  "finalPaidOnRazorpay": 750.2,
  "updateVistaOrderPrice_Log": {
    "logType": "updateVistaOrderPrice",
    "success": false,
    "newTicketTotal": 703,
    "discountAmount": 37,
    "cgst": 53.62,
    "sgst": 53.62,
    "message": "Vista order update not applied (keeping original Vista reservation)",
    "timestamp": "2026-09-11T10:19:50.943Z"
  },
  "vistaCommitBooking_Log": "Not committed / direct book"
}
```

### Transaction: `20000187215`
```json
{
  "transaction_id": "20000187215",
  "timestamp": "2026-09-11T10:14:23.093Z",
  "cinemaId": "65bcde931e72aef23e6854ee",
  "grossTicketPrice": 400,
  "discountApplied": 20,
  "discountedTicketTotal": 380,
  "finalPaidOnRazorpay": 427.2,
  "updateVistaOrderPrice_Log": {
    "logType": "updateVistaOrderPrice",
    "success": false,
    "newTicketTotal": 380,
    "discountAmount": 20,
    "cgst": 28.98,
    "sgst": 28.98,
    "message": "Vista order update not applied (keeping original Vista reservation)",
    "timestamp": "2026-09-11T10:14:23.093Z"
  },
  "vistaCommitBooking_Log": "Not committed / direct book"
}
```

### Transaction: `20000052360`
```json
{
  "transaction_id": "20000052360",
  "timestamp": "2026-09-11T10:09:06.643Z",
  "cinemaId": "66dec4a732f80e5ccda94c13",
  "grossTicketPrice": 450,
  "discountApplied": 22.5,
  "discountedTicketTotal": 427.5,
  "finalPaidOnRazorpay": 451.1,
  "updateVistaOrderPrice_Log": {
    "logType": "updateVistaOrderPrice",
    "success": false,
    "newTicketTotal": 427.5,
    "discountAmount": 22.5,
    "cgst": 32.61,
    "sgst": 32.61,
    "message": "Vista order update not applied (keeping original Vista reservation)",
    "timestamp": "2026-09-11T10:09:06.643Z"
  },
  "vistaCommitBooking_Log": "Not committed / direct book"
}
```

### Transaction: `20000148880`
```json
{
  "transaction_id": "20000148880",
  "timestamp": "2026-09-11T10:06:17.784Z",
  "cinemaId": "68403e37e1598c38f743a2fe",
  "grossTicketPrice": 600,
  "discountApplied": 10,
  "discountedTicketTotal": 590,
  "finalPaidOnRazorpay": 637.2,
  "updateVistaOrderPrice_Log": {
    "logType": "updateVistaOrderPrice",
    "success": false,
    "newTicketTotal": 590,
    "discountAmount": 10,
    "cgst": 45,
    "sgst": 45,
    "message": "Vista order update not applied (keeping original Vista reservation)",
    "timestamp": "2026-09-11T10:06:17.784Z"
  },
  "vistaCommitBooking_Log": {
    "success": true,
    "curTicketsTotal_in_Vista": 600,
    "curTotal_in_Vista": 600,
    "curTicketsTax1_in_Vista": 45.76,
    "curTicketsTax2_in_Vista": 45.76
  }
}
```

### Transaction: `20000148876`
```json
{
  "transaction_id": "20000148876",
  "timestamp": "2026-09-11T10:04:43.523Z",
  "cinemaId": "68403e37e1598c38f743a2fe",
  "grossTicketPrice": 600,
  "discountApplied": 10,
  "discountedTicketTotal": 590,
  "finalPaidOnRazorpay": 637.2,
  "updateVistaOrderPrice_Log": {
    "logType": "updateVistaOrderPrice",
    "success": false,
    "newTicketTotal": 590,
    "discountAmount": 10,
    "cgst": 45,
    "sgst": 45,
    "message": "Vista order update not applied (keeping original Vista reservation)",
    "timestamp": "2026-09-11T10:04:43.523Z"
  },
  "vistaCommitBooking_Log": "Not committed / direct book"
}
```

### Transaction: `20000052348`
```json
{
  "transaction_id": "20000052348",
  "timestamp": "2026-09-11T10:04:05.782Z",
  "cinemaId": "66dec4a732f80e5ccda94c13",
  "grossTicketPrice": 1600,
  "discountApplied": 80,
  "discountedTicketTotal": 1520,
  "finalPaidOnRazorpay": 1934.5,
  "updateVistaOrderPrice_Log": {
    "logType": "updateVistaOrderPrice",
    "success": false,
    "newTicketTotal": 1520,
    "discountAmount": 80,
    "cgst": 115.93,
    "sgst": 115.93,
    "message": "Vista order update not applied (keeping original Vista reservation)",
    "timestamp": "2026-09-11T10:04:05.782Z"
  },
  "vistaCommitBooking_Log": {
    "success": true,
    "curTicketsTotal_in_Vista": 1600,
    "curTotal_in_Vista": 1914.29,
    "curTicketsTax1_in_Vista": 122.04,
    "curTicketsTax2_in_Vista": 122.04
  }
}
```

### Transaction: `20000052329`
```json
{
  "transaction_id": "20000052329",
  "timestamp": "2026-09-11T09:50:05.693Z",
  "cinemaId": "66dec4a732f80e5ccda94c13",
  "grossTicketPrice": 1800,
  "discountApplied": 90,
  "discountedTicketTotal": 1710,
  "finalPaidOnRazorpay": 2124.5,
  "updateVistaOrderPrice_Log": {
    "logType": "updateVistaOrderPrice",
    "success": false,
    "newTicketTotal": 1710,
    "discountAmount": 90,
    "cgst": 130.41,
    "sgst": 130.41,
    "message": "Vista order update not applied (keeping original Vista reservation)",
    "timestamp": "2026-09-11T09:50:05.693Z"
  },
  "vistaCommitBooking_Log": "Not committed / direct book"
}
```

### Transaction: `20000052325`
```json
{
  "transaction_id": "20000052325",
  "timestamp": "2026-09-11T09:47:04.617Z",
  "cinemaId": "66dec4a732f80e5ccda94c13",
  "grossTicketPrice": 1800,
  "discountApplied": 90,
  "discountedTicketTotal": 1710,
  "finalPaidOnRazorpay": 2124.5,
  "updateVistaOrderPrice_Log": {
    "logType": "updateVistaOrderPrice",
    "success": false,
    "newTicketTotal": 1710,
    "discountAmount": 90,
    "cgst": 130.41,
    "sgst": 130.41,
    "message": "Vista order update not applied (keeping original Vista reservation)",
    "timestamp": "2026-09-11T09:47:04.617Z"
  },
  "vistaCommitBooking_Log": "Not committed / direct book"
}
```

### Transaction: `20000223124`
```json
{
  "transaction_id": "20000223124",
  "timestamp": "2026-09-11T09:46:49.969Z",
  "cinemaId": "66bcad163fa0ef7c41992606",
  "grossTicketPrice": 1750,
  "discountApplied": 87.5,
  "discountedTicketTotal": 1662.5,
  "finalPaidOnRazorpay": 1780.5,
  "updateVistaOrderPrice_Log": {
    "logType": "updateVistaOrderPrice",
    "success": false,
    "newTicketTotal": 1662.5,
    "discountAmount": 87.5,
    "cgst": 126.8,
    "sgst": 126.8,
    "message": "Vista order update not applied (keeping original Vista reservation)",
    "timestamp": "2026-09-11T09:46:49.969Z"
  },
  "vistaCommitBooking_Log": {
    "success": true,
    "curTicketsTotal_in_Vista": 1750,
    "curTotal_in_Vista": 1750,
    "curTicketsTax1_in_Vista": 133.45,
    "curTicketsTax2_in_Vista": 133.45
  }
}
```

### Transaction: `20000084354`
```json
{
  "transaction_id": "20000084354",
  "timestamp": "2026-09-11T09:44:55.362Z",
  "cinemaId": "65bcde931e72aef23e6854e5",
  "grossTicketPrice": 400,
  "discountApplied": 20,
  "discountedTicketTotal": 380,
  "finalPaidOnRazorpay": 427.2,
  "updateVistaOrderPrice_Log": {
    "logType": "updateVistaOrderPrice",
    "success": false,
    "newTicketTotal": 380,
    "discountAmount": 20,
    "cgst": 28.98,
    "sgst": 28.98,
    "message": "Vista order update not applied (keeping original Vista reservation)",
    "timestamp": "2026-09-11T09:44:55.362Z"
  },
  "vistaCommitBooking_Log": "Not committed / direct book"
}
```

