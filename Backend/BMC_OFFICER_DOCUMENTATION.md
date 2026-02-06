# BMC Officer API Documentation

This document describes all API routes available for BMC Officers, including registration, login, report management, and dashboard features.

---

## Table of Contents

1. [Officer Registration](#officer-registration)
2. [Officer Login](#officer-login)
3. [Get Current Officer Profile](#get-current-officer-profile)
4. [Report Management Routes](#report-management-routes)
   - [Get Pending Reports](#get-pending-reports)
   - [Submit Review (Approve/Reject)](#submit-review-approvereject)
   - [Get All Reports](#get-all-reports)
   - [Get Reports History by Society](#get-reports-history-by-society)
   - [Get Officer's Pending Reports](#get-officers-pending-reports)
   - [Get Officer's Reviewed Reports](#get-officers-reviewed-reports)
   - [Get Single Report Details](#get-single-report-details)
5. [Dashboard Routes](#dashboard-routes)
   - [Get Dashboard Statistics](#get-dashboard-statistics)
6. [Notification Routes](#notification-routes)
   - [Get Notifications](#get-notifications)
   - [Mark Notification as Read](#mark-notification-as-read)

---

## Authentication

All protected routes require:
- `Authorization: Bearer <token>` header
- Token obtained from `/api/officer/login`
- Role required: `officer` (role value: 12)

---

## Officer Registration

### Route
```
POST /api/officer/register
```

### Content-Type
`multipart/form-data`

### Input Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | String | Yes | Full name of the officer |
| `email` | String | Yes | Email address (unique per officer) |
| `password` | String | Yes | Password (min 6 characters) |
| `phone` | String | Yes | Phone number |
| `document` | File | Yes | ID document (PDF, JPG, PNG) |
| `documentType` | String | Yes | Type of document (e.g., "Aadhar", "PAN", "License") |

### Example Request (cURL)

```bash
curl -X POST http://localhost:3000/api/officer/register \
  -H "Content-Type: multipart/form-data" \
  -F "name=John Officer" \
  -F "email=john.officer@bmc.gov.in" \
  -F "password=securePassword123" \
  -F "phone=9876543210" \
  -F "document=@/path/to/aadhar.pdf" \
  -F "documentType=Aadhar"
```

### Success Response (201 Created)

```json
{
  "success": true,
  "message": "Officer registered successfully. Awaiting admin approval.",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "name": "John Officer",
      "email": "john.officer@bmc.gov.in",
      "phone": "9876543210",
      "role": 12,
      "isVerified": false,
      "documentType": "Aadhar"
    }
  }
}
```

### Error Responses

**Missing Document (400 Bad Request)**
```json
{
  "success": false,
  "message": "Document is required for officer registration"
}
```

**Email Already Exists (400 Bad Request)**
```json
{
  "success": false,
  "message": "Officer already exists with this email"
}
```

### Important Notes
- Officer accounts require **admin approval** before login
- After registration, `isVerified: false` - officer cannot login until admin approves
- Document is stored at `/uploads/officers/` directory

---

## Officer Login

### Route
```
POST /api/officer/login
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
curl -X POST http://localhost:3000/api/officer/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.officer@bmc.gov.in",
    "password": "securePassword123"
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
      "name": "John Officer",
      "email": "john.officer@bmc.gov.in",
      "phone": "9876543210",
      "role": 12,
      "isVerified": true
    }
  }
}
```

### Error Responses

**Account Pending Approval (403 Forbidden)**
```json
{
  "success": false,
  "message": "Account pending admin approval"
}
```

**Invalid Credentials (401 Unauthorized)**
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

### Important Notes
- Token must be included in `Authorization: Bearer <token>` header for all protected routes
- Token expires based on `JWT_EXPIRE` setting (default: 7 days)

---

## Get Current Officer Profile

### Route
```
GET /api/officer/me
```

### Headers
```
Authorization: Bearer <token>
```

### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "name": "John Officer",
      "email": "john.officer@bmc.gov.in",
      "phone": "9876543210",
      "role": 12,
      "isVerified": true,
      "documentType": "Aadhar",
      "verificationDate": "2026-01-15T10:30:00.000Z",
      "createdAt": "2026-01-10T08:00:00.000Z"
    }
  }
}
```

---

## Report Management Routes

### Get Pending Reports

Returns all reports pending verification across all societies.

### Route
```
GET /api/bmc/pending-reviews
```

### Headers
```
Authorization: Bearer <token>
```

### Query Parameters
None required.

### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Pending reviews retrieved successfully",
  "data": {
    "count": 15,
    "reports": [
      {
        "reportId": "507f1f77bcf86cd799439011",
        "submissionDate": "2026-02-06T10:30:00.000Z",
        "society": {
          "id": "507f1f77bcf86cd799439012",
          "societyName": "Green Valley Apartments",
          "email": "greenvalley@society.com",
          "phone": "9876543210"
        },
        "submittedBy": {
          "id": "507f1f77bcf86cd799439013",
          "name": "Jane Resident",
          "email": "jane.resident@email.com"
        },
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
        ],
        "gpsMetadata": {
          "latitude": 19.0760,
          "longitude": 72.8777,
          "accuracy": 10,
          "timestamp": "2026-02-06T10:30:00.000Z"
        },
        "iotSensorData": {
          "deviceId": "IOT-001",
          "deviceType": "VIBRATION_SENSOR",
          "vibrationStatus": "DETECTED",
          "sensorValue": 0.75,
          "batteryLevel": 85,
          "isOnline": true
        },
        "aiTrustScore": 78,
        "verificationProbability": 82,
        "expiresAt": "2026-02-13T10:30:00.000Z"
      }
    ]
  }
}
```

---

### Submit Review (Approve/Reject)

Officer can approve or reject a pending report.

### Route
```
PATCH /api/bmc/review/:id
```

### Headers
```
Authorization: Bearer <token>
Content-Type: application/json
```

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | String | Yes | Report ID (MongoDB ObjectId) |

### Input Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `action` | String | Yes | Either "APPROVE" or "REJECT" |
| `comments` | String | No | Officer's comments |
| `rebateAmount` | Number | No* | Amount to rebate (only if action=APPROVE) |
| `verificationImages` | Array | No | Array of verification image objects |

#### verificationImages Schema (optional)
```json
{
  "url": "http://localhost:3000/uploads/verification/officer-verification-xxx.png",
  "gpsMetadata": {
    "latitude": 19.0760,
    "longitude": 72.8777,
    "accuracy": 5
  }
}
```

### Example Request (cURL) - APPROVE

```bash
curl -X PATCH http://localhost:3000/api/bmc/review/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "APPROVE",
    "comments": "All documents verified. Composter in good condition.",
    "rebateAmount": 500
  }'
```

### Example Request (cURL) - REJECT

```bash
curl -X PATCH http://localhost:3000/api/bmc/review/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "REJECT",
    "comments": "Meter reading unclear. Please resubmit with clearer image."
  }'
```

### Success Response (200 OK) - APPROVE

```json
{
  "success": true,
  "message": "Report approved successfully",
  "data": {
    "reportId": "507f1f77bcf86cd799439011",
    "verificationStatus": "OFFICER_APPROVED",
    "approvalType": "OFFICER",
    "reviewTimestamp": "2026-02-06T11:00:00.000Z",
    "rebateAmount": 500
  }
}
```

### Success Response (200 OK) - REJECT

```json
{
  "success": true,
  "message": "Report rejected successfully",
  "data": {
    "reportId": "507f1f77bcf86cd799439011",
    "verificationStatus": "REJECTED",
    "approvalType": "OFFICER",
    "reviewTimestamp": "2026-02-06T11:00:00.000Z"
  }
}
```

### Error Responses

**Invalid Action (400 Bad Request)**
```json
{
  "success": false,
  "message": "Invalid action. Must be 'APPROVE' or 'REJECT'"
}
```

**Already Reviewed (400 Bad Request)**
```json
{
  "success": false,
  "message": "This report has already been reviewed"
}
```

**Report Not Found (404 Not Found)**
```json
{
  "success": false,
  "message": "Report not found"
}
```

### Important Notes
- Once a report is reviewed, its status changes from `PENDING` to `OFFICER_APPROVED` or `REJECTED`
- Approving adds `rebateAmount` to society's wallet balance
- Rejecting stores the rejection reason in `rejectionReason` field

---

### Get All Reports

Retrieve all reports with optional filters.

### Route
```
GET /api/bmc/reports
```

### Headers
```
Authorization: Bearer <token>
```

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `status` | String | No | Filter by status (PENDING, AUTO_APPROVED, OFFICER_APPROVED, REJECTED, EXPIRED) |
| `societyId` | String | No | Filter by society ID |
| `fromDate` | String | No | Filter from date (ISO 8601) |
| `toDate` | String | No | Filter to date (ISO 8601) |

### Example Request (cURL)

```bash
curl -X GET "http://localhost:3000/api/bmc/reports?status=PENDING&fromDate=2026-02-01" \
  -H "Authorization: Bearer <token>"
```

### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Reports retrieved successfully",
  "data": {
    "count": 25,
    "reports": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "societyAccountId": {
          "_id": "507f1f77bcf86cd799439012",
          "societyName": "Green Valley Apartments",
          "email": "greenvalley@society.com"
        },
        "submittedBy": {
          "_id": "507f1f77bcf86cd799439013",
          "name": "Jane Resident",
          "email": "jane.resident@email.com"
        },
        "submissionImages": [...],
        "verificationImages": [...],
        "gpsMetadata": {...},
        "iotSensorData": {...},
        "aiTrustScore": 78,
        "verificationProbability": 82,
        "verificationStatus": "PENDING",
        "approvalType": "NONE",
        "submissionDate": "2026-02-06T10:30:00.000Z"
      }
    ]
  }
}
```

---

### Get Reports History by Society

Retrieve daily report logs for a specific society.

### Route
```
GET /api/bmc/reports/history/:societyId
```

### Headers
```
Authorization: Bearer <token>
```

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `societyId` | String | Yes | Society Account ID (MongoDB ObjectId) |

### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Reports history retrieved successfully",
  "data": {
    "societyId": "507f1f77bcf86cd799439012",
    "societyName": "Green Valley Apartments",
    "totalSubmissions": 45,
    "dailyLogs": {
      "2026-02-06": [
        {
          "reportId": "507f1f77bcf86cd799439011",
          "submissionDate": "2026-02-06T10:30:00.000Z",
          "submissionImages": [...],
          "verificationImages": [...],
          "gpsMetadata": {...},
          "iotSensorData": {...},
          "aiTrustScore": 78,
          "verificationProbability": 82,
          "verificationStatus": "OFFICER_APPROVED",
          "approvalType": "OFFICER",
          "officerComments": "All documents verified",
          "rebateAmount": 500,
          "reviewTimestamp": "2026-02-06T11:00:00.000Z"
        }
      ],
      "2026-02-05": [...]
    }
  }
}
```

---

### Get Officer's Pending Reports

Get pending reports assigned to the current officer.

### Route
```
GET /api/bmc/officer/pending
```

### Headers
```
Authorization: Bearer <token>
```

### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Pending reports retrieved successfully",
  "data": {
    "count": 8,
    "reports": [
      {
        "reportId": "507f1f77bcf86cd799439011",
        "submissionDate": "2026-02-06T10:30:00.000Z",
        "daysUntilExpiry": 5,
        "society": {
          "id": "507f1f77bcf86cd799439012",
          "societyName": "Green Valley Apartments",
          "email": "greenvalley@society.com",
          "phone": "9876543210"
        },
        "submittedBy": {...},
        "submissionImages": [...],
        "gpsMetadata": {...},
        "iotSensorData": {...},
        "aiTrustScore": 78,
        "verificationProbability": 82,
        "autoApprovalThreshold": 50,
        "expiresAt": "2026-02-13T10:30:00.000Z"
      }
    ],
    "autoApprovalThreshold": 50,
    "reportExpiryDays": 7
  }
}
```

---

### Get Officer's Reviewed Reports

Get reports that the current officer has already reviewed.

### Route
```
GET /api/bmc/officer/reviewed
```

### Headers
```
Authorization: Bearer <token>
```

### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Reviewed reports retrieved successfully",
  "data": {
    "count": 32,
    "reports": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "societyAccountId": {...},
        "submittedBy": {...},
        "officerId": {...},
        "verificationStatus": "OFFICER_APPROVED",
        "approvalType": "OFFICER",
        "officerComments": "All documents verified",
        "rebateAmount": 500,
        "reviewTimestamp": "2026-02-06T11:00:00.000Z"
      }
    ]
  }
}
```

---

### Get Single Report Details

Get detailed information about a specific report.

### Route
```
GET /api/verification/reports/:id
```

### Headers
```
Authorization: Bearer <token>
```

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | String | Yes | Report ID (MongoDB ObjectId) |

### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "report": {
      "_id": "507f1f77bcf86cd799439011",
      "societyAccountId": {
        "_id": "507f1f77bcf86cd799439012",
        "societyName": "Green Valley Apartments",
        "email": "greenvalley@society.com",
        "phone": "9876543210",
        "address": "123 Main Street, Mumbai"
      },
      "submittedBy": {
        "_id": "507f1f77bcf86cd799439013",
        "name": "Jane Resident",
        "email": "jane.resident@email.com",
        "phone": "9876543210"
      },
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
      ],
      "verificationImages": [...],
      "gpsMetadata": {
        "latitude": 19.0760,
        "longitude": 72.8777,
        "accuracy": 10,
        "timestamp": "2026-02-06T10:30:00.000Z"
      },
      "iotSensorData": {
        "deviceId": "IOT-001",
        "deviceType": "VIBRATION_SENSOR",
        "vibrationStatus": "DETECTED",
        "sensorValue": 0.75,
        "batteryLevel": 85,
        "isOnline": true
      },
      "aiTrustScore": 78,
      "verificationProbability": 82,
      "verificationStatus": "OFFICER_APPROVED",
      "approvalType": "OFFICER",
      "officerId": {
        "_id": "507f1f77bcf86cd799439014",
        "name": "John Officer",
        "email": "john.officer@bmc.gov.in"
      },
      "reviewTimestamp": "2026-02-06T11:00:00.000Z",
      "officerComments": "All documents verified",
      "rebateAmount": 500,
      "submissionDate": "2026-02-06T10:30:00.000Z",
      "expiresAt": "2026-02-13T10:30:00.000Z",
      "createdAt": "2026-02-06T10:30:00.000Z",
      "updatedAt": "2026-02-06T11:00:00.000Z"
    }
  }
}
```

---

## Dashboard Routes

### Get Dashboard Statistics

Get overview statistics for the officer's dashboard.

### Route
```
GET /api/bmc/officer/dashboard
```

### Headers
```
Authorization: Bearer <token>
```

### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Dashboard statistics retrieved successfully",
  "data": {
    "pendingReports": 15,
    "reviewedToday": 5,
    "totalApproved": 120,
    "totalRejected": 8,
    "autoApproved": 45,
    "autoApprovalThreshold": 50,
    "recentExpiringReports": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "societyAccountId": {
          "_id": "507f1f77bcf86cd799439012",
          "societyName": "Green Valley Apartments"
        },
        "expiresAt": "2026-02-09T10:30:00.000Z"
      },
      {
        "_id": "507f1f77bcf86cd799439015",
        "societyAccountId": {
          "_id": "507f1f77bcf86cd799439016",
          "societyName": "Sunrise Society"
        },
        "expiresAt": "2026-02-10T10:30:00.000Z"
      }
    ]
  }
}
```

### Field Descriptions

| Field | Description |
|-------|-------------|
| `pendingReports` | Total number of reports waiting for review |
| `reviewedToday` | Number of reports reviewed by this officer today |
| `totalApproved` | Total number of reports approved by this officer |
| `totalRejected` | Total number of reports rejected by this officer |
| `autoApproved` | Total number of auto-approved reports (AI threshold met) |
| `recentExpiringReports` | Reports expiring within next 3 days |

---

## Notification Routes

### Get Notifications

Get notifications for the logged-in officer.

### Route
```
GET /api/bmc/officer/notifications
```

### Headers
```
Authorization: Bearer <token>
```

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `unreadOnly` | Boolean | No | If true, returns only unread notifications |
| `limit` | Number | No | Maximum notifications to return (default: 50) |
| `offset` | Number | No | Number of notifications to skip (default: 0) |

### Example Request (cURL)

```bash
curl -X GET "http://localhost:3000/api/bmc/officer/notifications?unreadOnly=true&limit=10" \
  -H "Authorization: Bearer <token>"
```

### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Notifications retrieved successfully",
  "data": {
    "notifications": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "officerId": "507f1f77bcf86cd799439014",
        "type": "REPORT_SUBMITTED",
        "title": "New Report Submitted",
        "message": "Green Valley Apartments has submitted a new report",
        "reportId": "507f1f77bcf86cd799439011",
        "societyId": "507f1f77bcf86cd799439012",
        "isRead": false,
        "createdAt": "2026-02-06T10:30:00.000Z"
      }
    ],
    "total": 1
  }
}
```

---

### Mark Notification as Read

Mark a notification as read.

### Route
```
PATCH /api/bmc/officer/notifications/:id/read
```

### Headers
```
Authorization: Bearer <token>
```

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | String | Yes | Notification ID (MongoDB ObjectId) |

### Example Request (cURL)

```bash
curl -X PATCH http://localhost:3000/api/bmc/officer/notifications/507f1f77bcf86cd799439011/read \
  -H "Authorization: Bearer <token>"
```

### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Notification marked as read"
}
```

### Error Response (404 Not Found)

```json
{
  "success": false,
  "message": "Notification not found"
}
```

---

## Report Status Values

| Status | Description |
|--------|-------------|
| `PENDING` | Report submitted, awaiting review |
| `AUTO_APPROVED` | Report auto-approved by system (AI scores >= threshold) |
| `OFFICER_APPROVED` | Report manually approved by officer |
| `REJECTED` | Report rejected by officer |
| `EXPIRED` | Report expired without review |

## Approval Type Values

| Type | Description |
|------|-------------|
| `NONE` | No approval decision yet |
| `AUTOMATIC` | Approved by system |
| `OFFICER` | Approved/Rejected by officer |

---

## Error Handling

All error responses follow this format:

```json
{
  "success": false,
  "message": "Error description here",
  "error": "Technical error message (optional)"
}
```

Common HTTP Status Codes:

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (invalid input) |
| 401 | Unauthorized (missing/invalid token) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found |
| 500 | Internal Server Error |

---

## Role Constants

| Role | Value | Description |
|------|-------|-------------|
| `officer` | 12 | BMC Officer |

---

## File Upload Notes

- Images are served from: `http://localhost:3000/uploads/verification/`
- Supported image formats: JPG, PNG, WebP
- Maximum file size: 10MB
- All image URLs in responses are full URLs accessible via HTTP
