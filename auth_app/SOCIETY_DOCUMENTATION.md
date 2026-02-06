# Society Management API Documentation

This document describes the complete society management system including registration, report submission, tax rebate calculation, and public access to society data.

---

## Table of Contents

1. [Society Registration](#society-registration)
2. [Society Login](#society-login)
3. [Report Submission](#report-submission)
4. [Report Auto-Approval & Rebate](#report-auto-approval--rebate-calculation)
5. [Public Society Access](#public-society-access)
6. [Marketplace (Compost) API](#marketplace-compost-api)

---

## Society Registration

### Route
```
POST /api/society/register
```

### Content-Type
`application/json`

### Input Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | String | Yes | Name of the society worker registering |
| `email` | String | Yes | Email address (unique per society) |
| `password` | String | Yes | Password (min 6 characters) |
| `phone` | String | Yes | Contact number |
| `societyName` | String | Yes | Name of the society |
| `address.street` | String | Yes | Street address |
| `address.city` | String | Yes | City |
| `address.state` | String | Yes | State |
| `address.pincode` | String | Yes | Pincode |
| `geoLockCoordinates.latitude` | Number | Yes | Society location latitude (-90 to 90) |
| `geoLockCoordinates.longitude` | Number | Yes | Society location longitude (-180 to 180) |
| `propertyTaxEstimate` | Number | Yes | Annual property tax estimate for rebate calculation |
| `electricMeterSerialNumber` | String | Yes | Serial number of the society's electric meter |
| `dailyCompostWeight` | Number | No* | Daily compost weight available for sale (kg) |

### Example Request (cURL)

```bash
curl -X POST http://localhost:3000/api/society/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Manager",
    "email": "manager@greenvalley.in",
    "password": "securePass123",
    "phone": "9876543210",
    "societyName": "Green Valley Apartments",
    "address": {
      "street": "123 Main Road",
      "city": "Mumbai",
      "state": "Maharashtra",
      "pincode": "400001"
    },
    "geoLockCoordinates": {
      "latitude": 19.0760,
      "longitude": 72.8777
    },
    "propertyTaxEstimate": 500000,
    "electricMeterSerialNumber": "EM-2024-12345",
    "dailyCompostWeight": 25.5
  }'
```

### Success Response (201 Created)

```json
{
  "success": true,
  "message": "Society worker registered successfully. Pending admin approval.",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "name": "John Manager",
      "email": "manager@greenvalley.in",
      "phone": "9876543210",
      "role": 14,
      "societyId": "507f1f77bcf86cd799439012",
      "societyName": "Green Valley Apartments",
      "isVerified": false
    },
    "society": {
      "id": "507f1f77bcf86cd799439012",
      "societyName": "Green Valley Apartments",
      "propertyTaxEstimate": 500000,
      "electricMeterSerialNumber": "EM-2024-12345",
      "dailyCompostWeight": 25.5,
      "isVerified": false
    }
  }
}
```

### Important Notes
- Society accounts require **admin approval** before login
- `propertyTaxEstimate` is used for calculating tax rebates
- `electricMeterSerialNumber` is verified against meter readings
- `dailyCompostWeight` is used for marketplace listings

---

## Society Login

### Route
```
POST /api/society/login
```

### Content-Type
`application/json`

### Input Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | String | Yes | Registered email address |
| `password` | String | Yes | Account password |

### Example Request (cURL)

```bash
curl -X POST http://localhost:3000/api/society/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "manager@greenvalley.in",
    "password": "securePass123"
  }'
```

### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "name": "John Manager",
      "email": "manager@greenvalley.in",
      "phone": "9876543210",
      "role": 14,
      "societyId": "507f1f77bcf86cd799439012",
      "societyName": "Green Valley Apartments",
      "isVerified": true
    },
    "society": {
      "id": "507f1f77bcf86cd799439012",
      "societyName": "Green Valley Apartments",
      "walletBalance": 2500.50,
      "totalRebatesEarned": 15000.00,
      "complianceStreak": 15
    }
  }
}
```

---

## Report Submission

### Route
```
POST /api/verification/report/upload
```

### Content-Type
`multipart/form-data`

### Input Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `meter_image` | File | Yes* | Meter reading image |
| `composter_image` | File | Yes* | Composter image |
| `societyName` | String | No** | Society name (if not using auth) |
| `societyId` | String | No** | Society ID (if not using auth) |
| `geoLocationData` | JSON String | No | Geo coordinates with timestamp |

### Example Request (cURL)

```bash
curl -X POST http://localhost:3000/api/verification/report/upload \
  -H "Authorization: Bearer <token>" \
  -F "meter_image=@/path/to/meter.jpg" \
  -F "composter_image=@/path/to/composter.jpg" \
  -F "geoLocationData={\"latitude\":19.0760,\"longitude\":72.8777,\"accuracy\":10}"
```

### Success Response (201 Created)

```json
{
  "success": true,
  "message": "Report submitted successfully",
  "data": {
    "reportId": "507f1f77bcf86cd799439011",
    "submissionDate": "2026-02-06T10:30:00.000Z",
    "society": {
      "id": "507f1f77bcf86cd799439012",
      "societyName": "Green Valley Apartments"
    },
    "verificationStatus": "PENDING",
    "expiresAt": "2026-02-13T10:30:00.000Z",
    "n8nTriggered": true,
    "imagesUploaded": 2
  }
}
```

### Submission Images Schema

```json
{
  "submissionImages": [
    {
      "url": "http://localhost:3000/uploads/verification/meter-xxx.png",
      "uploadedAt": "2026-02-06T10:30:00.000Z",
      "label": "meter_image",
      "gpsMetadata": {
        "latitude": 19.0760,
        "longitude": 72.8777,
        "accuracy": 10,
        "timestamp": "2026-02-06T10:25:00.000Z"
      }
    },
    {
      "url": "http://localhost:3000/uploads/verification/composter-xxx.png",
      "uploadedAt": "2026-02-06T10:30:00.000Z",
      "label": "composter_image"
    }
  ]
}
```

---

## Report Auto-Approval & Rebate Calculation

### Auto-Approval Rules

Reports are automatically processed when they expire (7 days after submission):

| Condition | Result |
|-----------|--------|
| `verificationProbability >= 50%` | AUTO_APPROVED |
| `verificationProbability < 50%` | REJECTED |

### Rebate Calculation Formula

```
rebateAmount = propertyTaxEstimate × 0.05 × (approvedDays / 365)
```

### Example Calculation

If a society has:
- `propertyTaxEstimate = ₹500,000`
- Report approved after 5 days

```
rebateAmount = 500,000 × 0.05 × (5 / 365)
             = 25,000 × 0.0137
             = ₹342.47
```

### Fields Updated on Approval

```json
{
  "verificationStatus": "AUTO_APPROVED",
  "approvalType": "AUTOMATIC",
  "rebateAmount": 342.47,
  "approvedDays": 5,
  "autoProcessedAt": "2026-02-13T10:30:00.000Z",
  "autoProcessedBy": "SYSTEM_AUTO_PROCESSOR"
}
```

### Society Wallet Update

```json
{
  "walletBalance": 2842.47,
  "totalRebatesEarned": 15000.00,
  "lastComplianceDate": "2026-02-13T10:30:00.000Z"
}
```

---

## Public Society Access

### Get All Societies

```
GET /api/public/societies
```

### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `compostAvailable` | Boolean | If true, returns only societies with compost available |

### Example Request (cURL)

```bash
curl -X GET "http://localhost:3000/api/public/societies?compostAvailable=true" \
  -H "Content-Type: application/json"
```

### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Societies retrieved successfully",
  "data": {
    "count": 25,
    "societies": [
      {
        "societyName": "Green Valley Apartments",
        "email": "contact@greenvalley.in",
        "phone": "9876543210",
        "address": {
          "street": "123 Main Road",
          "city": "Mumbai",
          "state": "Maharashtra",
          "pincode": "400001"
        },
        "dailyCompostWeight": 25.5,
        "totalRebatesEarned": 15000.00,
        "lastComplianceDate": "2026-02-05T10:00:00.000Z"
      }
    ]
  }
}
```

### Get Society by Name

```
GET /api/public/societies/:societyName
```

### Example Request (cURL)

```bash
curl -X GET "http://localhost:3000/api/public/societies/Green%20Valley%20Apartments" \
  -H "Content-Type: application/json"
```

### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "society": {
      "societyName": "Green Valley Apartments",
      "email": "contact@greenvalley.in",
      "phone": "9876543210",
      "address": {
        "street": "123 Main Road",
        "city": "Mumbai",
        "state": "Maharashtra",
        "pincode": "400001"
      },
      "propertyTaxEstimate": 500000,
      "electricMeterSerialNumber": "EM-2024-12345",
      "dailyCompostWeight": 25.5,
      "walletBalance": 2842.47,
      "totalRebatesEarned": 15000.00,
      "complianceStreak": 15,
      "lastComplianceDate": "2026-02-05T10:00:00.000Z",
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  }
}
```

### Get Society Reports

```
GET /api/public/societies/:societyName/reports
```

### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `status` | String | Filter by status (PENDING, AUTO_APPROVED, OFFICER_APPROVED, REJECTED) |
| `fromDate` | String | Filter from date (ISO 8601) |
| `toDate` | String | Filter to date (ISO 8601) |
| `limit` | Number | Maximum reports to return (default: 100) |

### Example Request (cURL)

```bash
curl -X GET "http://localhost:3000/api/public/societies/Green%20Valley%20Apartments/reports?status=AUTO_APPROVED" \
  -H "Content-Type: application/json"
```

### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Society reports retrieved successfully",
  "data": {
    "society": {
      "societyName": "Green Valley Apartments",
      "totalRebatesEarned": 15000.00
    },
    "count": 45,
    "reports": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "submissionDate": "2026-02-06T10:30:00.000Z",
        "submissionImages": [
          {
            "url": "http://localhost:3000/uploads/verification/meter-xxx.png",
            "label": "meter_image"
          },
          {
            "url": "http://localhost:3000/uploads/verification/composter-xxx.png",
            "label": "composter_image"
          }
        ],
        "gpsMetadata": {
          "latitude": 19.0760,
          "longitude": 72.8777
        },
        "aiTrustScore": 78,
        "verificationProbability": 82,
        "verificationStatus": "AUTO_APPROVED",
        "rebateAmount": 342.47,
        "approvedDays": 5
      }
    ]
  }
}
```

### Get Single Report Details

```
GET /api/public/societies/:societyName/reports/:reportId
```

### Example Request (cURL)

```bash
curl -X GET "http://localhost:3000/api/public/societies/Green%20Valley%20Apartments/reports/507f1f77bcf86cd799439011" \
  -H "Content-Type: application/json"
```

### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "society": {
      "societyName": "Green Valley Apartments",
      "address": {
        "street": "123 Main Road",
        "city": "Mumbai",
        "state": "Maharashtra",
        "pincode": "400001"
      },
      "propertyTaxEstimate": 500000
    },
    "report": {
      "_id": "507f1f77bcf86cd799439011",
      "submissionDate": "2026-02-06T10:30:00.000Z",
      "submissionImages": [...],
      "verificationImages": [...],
      "gpsMetadata": {...},
      "aiTrustScore": 78,
      "verificationProbability": 82,
      "verificationStatus": "AUTO_APPROVED",
      "approvalType": "AUTOMATIC",
      "rebateAmount": 342.47,
      "approvedDays": 5,
      "reviewTimestamp": "2026-02-13T10:30:00.000Z"
    }
  }
}
```

---

## Marketplace (Compost) API

### Get Societies with Compost Available

```
GET /api/public/societies?compostAvailable=true
```

Returns only societies that have `dailyCompostWeight > 0`

### Update Daily Compost Weight (Society Only)

```
PATCH /api/society/society/compost-weight
```

### Headers
```
Authorization: Bearer <token>
Content-Type: application/json
```

### Input Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `dailyCompostWeight` | Number | Yes | New daily compost weight (kg) |

### Example Request (cURL)

```bash
curl -X PATCH http://localhost:3000/api/society/society/compost-weight \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "dailyCompostWeight": 30.5
  }'
```

### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Daily compost weight updated successfully",
  "data": {
    "dailyCompostWeight": 30.5
  }
}
```

---

## Report Status Values

| Status | Description |
|--------|-------------|
| `PENDING` | Report submitted, awaiting review |
| `AUTO_APPROVED` | Report auto-approved by system (verificationProbability >= 50%) |
| `OFFICER_APPROVED` | Report manually approved by BMC officer |
| `REJECTED` | Report rejected by officer or auto-rejected |
| `EXPIRED` | Report expired without review |

---

## Schema Changes Summary

### SocietyAccount Model - New Fields

| Field | Type | Description |
|-------|------|-------------|
| `propertyTaxEstimate` | Number | Annual property tax for rebate calculation |
| `electricMeterSerialNumber` | String | Society's electric meter serial number |
| `dailyCompostWeight` | Number | Daily compost available for marketplace (kg) |

### Report Model - New Fields

| Field | Type | Description |
|-------|------|-------------|
| `approvedDays` | Number | Number of days from submission to approval (for rebate calc) |

---

## Workflow Summary

### Daily Society Workflow

```
1. Society uploads daily report
   ↓
   POST /api/verification/report/upload
   (meter_image + composter_image)
   ↓
2. Images stored, report created with PENDING status
   ↓
3. n8n workflow triggered for verification
   ↓
4. Verification probability calculated
   ↓
5a. If officer reviews within 7 days:
    - Officer approves/rejects
    - Rebate calculated: propertyTax × 0.05 × (days/365)
    ↓
5b. If no review after 7 days:
    - AUTO_APPROVED if prob >= 50%
    - REJECTED if prob < 50%
    - Rebate calculated automatically
   ↓
6. Society wallet credited with rebate amount
```

### Public Access Workflow

```
1. Anyone can view society details
   GET /api/public/societies/:name
   ↓
2. View all society reports
   GET /api/public/societies/:name/reports
   ↓
3. View individual report details
   GET /api/public/societies/:name/reports/:id
   ↓
4. See rebate amounts earned
   (included in report response)
```

---

## Tax Rebate Formula

```
Rebate = PropertyTaxEstimate × 0.05 × (DaysToApprove / 365)
```

**Example:**
- Property Tax Estimate: ₹500,000
- Days to Approve: 7
- Rebate: 500,000 × 0.05 × (7/365) = ₹479.45

This encourages timely verification while providing fair rebates based on how quickly the report is processed.
