# Testing Guide - Genesis Backend

Complete testing guide for the Genesis waste management system with all features including authentication, verification, leaderboard, and BMC workflows.

## Table of Contents
1. [Quick Start](#quick-start)
2. [Prerequisites](#prerequisites)
3. [Environment Setup](#environment-setup)
4. [Authentication Testing](#authentication-testing)
5. [Role-Based Workflows](#role-based-workflows)
6. [Verification System](#verification-system)
7. [Public API Testing](#public-api-testing)
8. [BMC Officer Dashboard](#bmc-officer-dashboard)
9. [Admin Management](#admin-management)
10. [Complete End-to-End Scenarios](#complete-end-to-end-scenarios)
11. [Postman/Hoppscotch Collections](#postmanhoppscotch-collections)
12. [Troubleshooting](#troubleshooting)

---

## Quick Start

### 1. Start MongoDB
```bash
cd /home/aaditralph/Desktop/Hackathon/Genesis/Backend
docker-compose up -d
```

### 2. Start Server
```bash
bun run dev
```

### 3. Test Health Endpoint
```bash
curl http://localhost:3000/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-02-07T00:00:00.000Z",
  "uptime": 10.5
}
```

---

## Prerequisites

### Required Services
- MongoDB (via Docker)
- Bun runtime
- Network access to port 3000

### Test Data Preparation
```bash
# Create upload directories
mkdir -p uploads/officers uploads/verification

# Create test images (use any JPG/PNG files)
cp /path/to/test-image.jpg uploads/verification/test-meter.jpg
cp /path/to/test-image.jpg uploads/verification/test-composter.jpg

# Create test document
echo "Test ID Document" > test_document.txt
```

---

## Environment Setup

### Environment Variables (.env)
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/genesis
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRE=7d
NODE_ENV=development
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880
```

### Test Base URL
```
http://localhost:3000
```

---

## Authentication Testing

### 1. Admin Login (DABS User)

**Endpoint:** `POST /admin/login`

**Request:**
```json
{
  "email": "DABS",
  "password": "123"
}
```

**cURL:**
```bash
curl -X POST http://localhost:3000/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"DABS","password":"123"}'
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "...",
      "name": "DABS",
      "email": "DABS",
      "role": 11
    }
  }
}
```

**Save token as:** `ADMIN_TOKEN`

---

### 2. BMC Officer Registration & Approval Workflow

#### Step 2.1: Register Officer with Document

**Endpoint:** `POST /api/officer/register`

**Request (Multipart/Form-Data):**
```
- name: John Officer
- email: officer@bmc.gov.in
- password: password123
- phone: 9876543210
- documentType: Aadhar
- document: @test_document.txt
```

**cURL:**
```bash
curl -X POST http://localhost:3000/api/officer/register \
  -F "name=John Officer" \
  -F "email=officer@bmc.gov.in" \
  -F "password=password123" \
  -F "phone=9876543210" \
  -F "documentType=Aadhar" \
  -F "document=@test_document.txt"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Officer registered successfully. Awaiting admin approval.",
  "data": {
    "user": {
      "id": "...",
      "name": "John Officer",
      "email": "officer@bmc.gov.in",
      "role": 12,
      "isVerified": false
    }
  }
}
```

**Verify upload:** `ls uploads/officers/` should show uploaded file

#### Step 2.2: Login Before Approval (Should Fail)

**Endpoint:** `POST /api/officer/login`

**Request:**
```json
{
  "email": "officer@bmc.gov.in",
  "password": "password123"
}
```

**Response (403 Forbidden):**
```json
{
  "success": false,
  "message": "Account pending admin approval"
}
```

#### Step 2.3: Admin Approves Officer

**Endpoint:** `PUT /admin/approve-officer/:id`

**cURL:**
```bash
curl -X PUT "http://localhost:3000/admin/approve-officer/$OFFICER_ID" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Officer approved successfully",
  "data": {
    "officer": {
      "id": "...",
      "name": "John Officer",
      "isVerified": true
    }
  }
}
```

**Verify file deletion:** `ls uploads/officers/` should be empty

#### Step 2.4: Login After Approval (Should Succeed)

**Endpoint:** `POST /api/officer/login`

**Request:**
```json
{
  "email": "officer@bmc.gov.in",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "...",
      "name": "John Officer",
      "email": "officer@bmc.gov.in",
      "role": 12,
      "isVerified": true
    }
  }
}
```

**Save token as:** `OFFICER_TOKEN`

---

### 3. Society Worker Registration & Approval

#### Step 3.1: Register Society Worker

**Endpoint:** `POST /api/society/register`

**Request:**
```json
{
  "name": "Mike Manager",
  "email": "manager@greenvalley.in",
  "password": "password123",
  "phone": "9876543210",
  "societyName": "Green Valley",
  "designation": "manager",
  "employeeId": "GV-001",
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
  "electricMeterSerialNumber": "EM-2024-12345"
}
```

**cURL:**
```bash
curl -X POST http://localhost:3000/api/society/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Mike Manager",
    "email": "manager@greenvalley.in",
    "password": "password123",
    "phone": "9876543210",
    "societyName": "Green Valley",
    "designation": "manager",
    "employeeId": "GV-001",
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
    "electricMeterSerialNumber": "EM-2024-12345"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Society worker registered successfully. Awaiting admin approval.",
  "data": {
    "user": {
      "id": "...",
      "name": "Mike Manager",
      "email": "manager@greenvalley.in",
      "societyName": "Green Valley",
      "role": 14,
      "isVerified": false
    }
  }
}
```

#### Step 3.2: Admin Approves Society

**Endpoint:** `PUT /admin/approve-society/:id`

**cURL:**
```bash
curl -X PUT "http://localhost:3000/admin/approve-society/$SOCIETY_ID" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

#### Step 3.3: Society Login

**Endpoint:** `POST /api/society/login`

**cURL:**
```bash
curl -X POST http://localhost:3000/api/society/login \
  -H "Content-Type: application/json" \
  -d '{"email":"manager@greenvalley.in","password":"password123"}'
```

**Save token as:** `SOCIETY_TOKEN`

#### Step 3.4: Update Daily Compost Weight

**Endpoint:** `PATCH /api/society/society/compost-weight`

**Request:**
```json
{
  "weight": 25.5
}
```

**cURL:**
```bash
curl -X PATCH http://localhost:3000/api/society/society/compost-weight \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SOCIETY_TOKEN" \
  -d '{"weight": 25.5}'
```

---

### 4. Resident Registration

**Endpoint:** `POST /api/resident/register`

**Request:**
```json
{
  "name": "Jane Resident",
  "email": "jane@greenvalley.in",
  "password": "password123",
  "phone": "9876543210",
  "societyName": "Green Valley",
  "flatNumber": "A-101",
  "buildingName": "Tower A"
}
```

**cURL:**
```bash
curl -X POST http://localhost:3000/api/resident/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Resident",
    "email": "jane@greenvalley.in",
    "password": "password123",
    "phone": "9876543210",
    "societyName": "Green Valley",
    "flatNumber": "A-101",
    "buildingName": "Tower A"
  }'
```

**Save token as:** `RESIDENT_TOKEN`

---

### 5. Customer Registration

**Endpoint:** `POST /api/customer/register`

**Request:**
```json
{
  "name": "Alice Customer",
  "email": "alice@email.com",
  "password": "password123",
  "phone": "9876543210",
  "addresses": [
    {
      "street": "456 Park Street",
      "city": "Mumbai",
      "state": "Maharashtra",
      "pincode": "400002",
      "landmark": "Near Metro Station",
      "isDefault": true
    }
  ]
}
```

**Save token as:** `CUSTOMER_TOKEN`

---

## Verification System Testing

### 1. Submit Verification Report (with Images)

**Endpoint:** `POST /api/verification/report/upload`

**Headers:**
```
Authorization: Bearer $SOCIETY_TOKEN
```

**Request (Multipart/Form-Data):**
```
- societyAccountId: [Society Account ID]
- meter_image: @test-meter.jpg
- composter_image: @test-composter.jpg
- gpsLatitude: 19.0760
- gpsLongitude: 72.8777
- notes: Morning verification
```

**cURL:**
```bash
curl -X POST http://localhost:3000/api/verification/report/upload \
  -H "Authorization: Bearer $SOCIETY_TOKEN" \
  -F "societyAccountId=$SOCIETY_ACCOUNT_ID" \
  -F "meter_image=@uploads/verification/test-meter.jpg" \
  -F "composter_image=@uploads/verification/test-composter.jpg" \
  -F "gpsLatitude=19.0760" \
  -F "gpsLongitude=72.8777" \
  -F "notes=Morning verification"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Report submitted successfully",
  "data": {
    "reportId": "...",
    "status": "PENDING",
    "submissionDate": "2026-02-07T00:00:00.000Z"
  }
}
```

**Save report ID:** `REPORT_ID`

---

### 2. Process Verification (AI Detection)

**Endpoint:** `POST /api/verification/detect`

**Request:**
```json
{
  "reportId": "$REPORT_ID"
}
```

**cURL:**
```bash
curl -X POST http://localhost:3000/api/verification/detect \
  -H "Authorization: Bearer $SOCIETY_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"reportId\":\"$REPORT_ID\"}"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Verification processed successfully",
  "data": {
    "verificationStatus": "AUTO_APPROVED",
    "verificationProbability": 0.85,
    "rebateAmount": 68.49,
    "approvedDays": 5,
    "trustScore": 0.82
  }
}
```

---

### 3. Get My Reports

**Endpoint:** `GET /api/verification/reports/my`

**cURL:**
```bash
curl http://localhost:3000/api/verification/reports/my \
  -H "Authorization: Bearer $SOCIETY_TOKEN"
```

---

### 4. Get Report by ID

**Endpoint:** `GET /api/verification/reports/:id`

**cURL:**
```bash
curl http://localhost:3000/api/verification/reports/$REPORT_ID \
  -H "Authorization: Bearer $SOCIETY_TOKEN"
```

---

## BMC Officer Dashboard Testing

### 1. Get Pending Reviews

**Endpoint:** `GET /api/bmc/pending-reviews`

**cURL:**
```bash
curl http://localhost:3000/api/bmc/pending-reviews \
  -H "Authorization: Bearer $OFFICER_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "count": 5,
    "reports": [
      {
        "id": "...",
        "societyName": "Green Valley",
        "submissionDate": "2026-02-07T00:00:00.000Z",
        "verificationProbability": 0.85,
        "status": "PENDING"
      }
    ]
  }
}
```

---

### 2. Submit Officer Review

**Endpoint:** `PATCH /api/bmc/review/:id`

**Request:**
```json
{
  "action": "APPROVE",
  "comments": "Verified and approved for rebate"
}
```

**cURL:**
```bash
curl -X PATCH "http://localhost:3000/api/bmc/review/$REPORT_ID" \
  -H "Authorization: Bearer $OFFICER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"action":"APPROVE","comments":"Verified and approved for rebate"}'
```

**Action Options:** `APPROVE`, `REJECT`

---

### 3. Get Officer Dashboard Stats

**Endpoint:** `GET /api/bmc/officer/dashboard`

**cURL:**
```bash
curl http://localhost:3000/api/bmc/officer/dashboard \
  -H "Authorization: Bearer $OFFICER_TOKEN"
```

---

### 4. Get Officer Notifications

**Endpoint:** `GET /api/bmc/officer/notifications`

**cURL:**
```bash
curl http://localhost:3000/api/bmc/officer/notifications \
  -H "Authorization: Bearer $OFFICER_TOKEN"
```

---

## Public API Testing (No Auth Required)

### 1. Get All Societies

**Endpoint:** `GET /api/resident/societies`

**cURL:**
```bash
curl "http://localhost:3000/api/resident/societies?compostAvailable=true"
```

---

### 2. Get Society Details

**Endpoint:** `GET /api/resident/societies/:name`

**cURL:**
```bash
curl http://localhost:3000/api/resident/societies/Green%20Valley
```

---

### 3. Get Society Reports

**Endpoint:** `GET /api/resident/societies/:name/reports`

**Query Parameters:**
- `status`: PENDING, AUTO_APPROVED, AUTO_REJECTED, OFFICER_APPROVED, OFFICER_REJECTED
- `fromDate`: ISO date
- `toDate`: ISO date
- `limit`: number

**cURL:**
```bash
curl "http://localhost:3000/api/resident/societies/Green%20Valley/reports?status=AUTO_APPROVED&limit=10"
```

---

### 4. Get Society Tax Rebates

**Endpoint:** `GET /api/resident/societies/:name/tax-rebates`

**cURL:**
```bash
curl "http://localhost:3000/api/resident/societies/Green%20Valley/tax-rebates?fromDate=2026-01-01&toDate=2026-12-31"
```

---

### 5. Leaderboard

#### Get Full Leaderboard

**Endpoint:** `GET /api/resident/leaderboard`

**cURL:**
```bash
curl "http://localhost:3000/api/resident/leaderboard?limit=10&offset=0"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Leaderboard retrieved successfully",
  "data": {
    "count": 10,
    "total": 50,
    "leaderboard": [
      {
        "rank": 1,
        "societyId": "...",
        "societyName": "Green Valley",
        "totalReports": 25,
        "approvedReports": 22,
        "consistencyScore": 88.0,
        "averageVerificationScore": 85.5,
        "complianceStreak": 15,
        "totalRebatesEarned": 3424.5,
        "overallScore": 85,
        "lastComplianceDate": "2026-02-07T00:00:00.000Z"
      }
    ]
  }
}
```

#### Get Top N Societies

**Endpoint:** `GET /api/resident/leaderboard/top/:position`

**cURL:**
```bash
curl http://localhost:3000/api/resident/leaderboard/top/5
```

#### Get Society Rank

**Endpoint:** `GET /api/resident/leaderboard/society/:name`

**cURL:**
```bash
curl http://localhost:3000/api/resident/leaderboard/society/Green%20Valley
```

---

## Admin Management Testing

### 1. Get Pending Officers

**Endpoint:** `GET /admin/pending-officers`

**cURL:**
```bash
curl http://localhost:3000/admin/pending-officers \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

---

### 2. Reject Officer

**Endpoint:** `DELETE /admin/reject-officer/:id`

**cURL:**
```bash
curl -X DELETE "http://localhost:3000/admin/reject-officer/$OFFICER_ID" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

---

### 3. Get Pending Societies

**Endpoint:** `GET /admin/pending-societies`

**cURL:**
```bash
curl http://localhost:3000/admin/pending-societies \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

---

### 4. Reject Society

**Endpoint:** `DELETE /admin/reject-society/:id`

**cURL:**
```bash
curl -X DELETE "http://localhost:3000/admin/reject-society/$SOCIETY_ID" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

---

### 5. Get All Societies (Admin)

**Endpoint:** `GET /admin/societies`

**cURL:**
```bash
curl http://localhost:3000/admin/societies \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

---

## Complete End-to-End Scenarios

### Scenario 1: Complete Verification Workflow

```bash
#!/bin/bash
# Complete verification workflow test

BASE_URL="http://localhost:3000"

echo "=== 1. Admin Login ==="
ADMIN_RESP=$(curl -s -X POST "$BASE_URL/admin/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"DABS","password":"123"}')
ADMIN_TOKEN=$(echo $ADMIN_RESP | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
echo "Admin Token: ${ADMIN_TOKEN:0:20}..."

echo -e "\n=== 2. Register Society ==="
echo "Test ID Document" > test_doc.txt
SOCIETY_RESP=$(curl -s -X POST "$BASE_URL/api/society/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Manager",
    "email": "test@greenvalley.in",
    "password": "password123",
    "phone": "9876543210",
    "societyName": "Green Valley",
    "designation": "manager",
    "address": {"street":"123 Main","city":"Mumbai","state":"Maharashtra","pincode":"400001"},
    "propertyTaxEstimate": 500000
  }')
SOCIETY_ID=$(echo $SOCIETY_RESP | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "Society ID: $SOCIETY_ID"

echo -e "\n=== 3. Admin Approves Society ==="
curl -s -X PUT "$BASE_URL/admin/approve-society/$SOCIETY_ID" \
  -H "Authorization: Bearer $ADMIN_TOKEN"

echo -e "\n=== 4. Society Login ==="
SOCIETY_RESP=$(curl -s -X POST "$BASE_URL/api/society/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@greenvalley.in","password":"password123"}')
SOCIETY_TOKEN=$(echo $SOCIETY_RESP | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
SOCIETY_ACCOUNT_ID=$(echo $SOCIETY_RESP | grep -o '"societyAccountId":"[^"]*"' | cut -d'"' -f4)
echo "Society Token: ${SOCIETY_TOKEN:0:20}..."

echo -e "\n=== 5. Submit Verification Report ==="
# Create test image
convert -size 100x100 xc:blue test_image.jpg 2>/dev/null || echo "skipping image creation"

REPORT_RESP=$(curl -s -X POST "$BASE_URL/api/verification/report/upload" \
  -H "Authorization: Bearer $SOCIETY_TOKEN" \
  -F "societyAccountId=$SOCIETY_ACCOUNT_ID" \
  -F "meter_image=@test_image.jpg" \
  -F "composter_image=@test_image.jpg" \
  -F "gpsLatitude=19.0760" \
  -F "gpsLongitude=72.8777")
REPORT_ID=$(echo $REPORT_RESP | grep -o '"reportId":"[^"]*"' | cut -d'"' -f4)
echo "Report ID: $REPORT_ID"

echo -e "\n=== 6. Process Verification ==="
curl -s -X POST "$BASE_URL/api/verification/detect" \
  -H "Authorization: Bearer $SOCIETY_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"reportId\":\"$REPORT_ID\"}"

echo -e "\n=== 7. Check Leaderboard ==="
curl -s "$BASE_URL/api/resident/leaderboard"

echo -e "\n=== Cleanup ==="
rm -f test_doc.txt test_image.jpg
```

---

### Scenario 2: BMC Officer Review Workflow

```bash
#!/bin/bash
# BMC Officer review workflow

BASE_URL="http://localhost:3000"

echo "=== 1. Officer Login ==="
OFFICER_RESP=$(curl -s -X POST "$BASE_URL/api/officer/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"officer@bmc.gov.in","password":"password123"}')
OFFICER_TOKEN=$(echo $OFFICER_RESP | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
echo "Officer Token: ${OFFICER_TOKEN:0:20}..."

echo -e "\n=== 2. Get Pending Reviews ==="
curl -s "$BASE_URL/api/bmc/pending-reviews" \
  -H "Authorization: Bearer $OFFICER_TOKEN"

echo -e "\n=== 3. Submit Officer Review (Approve) ==="
REPORT_ID="[REPORT_ID]"
curl -s -X PATCH "$BASE_URL/api/bmc/review/$REPORT_ID" \
  -H "Authorization: Bearer $OFFICER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"action":"APPROVE","comments":"Verified - all criteria met"}'

echo -e "\n=== 4. Get Dashboard Stats ==="
curl -s "$BASE_URL/api/bmc/officer/dashboard" \
  -H "Authorization: Bearer $OFFICER_TOKEN"
```

---

### Scenario 3: Public Leaderboard Access

```bash
#!/bin/bash
# Public leaderboard access

BASE_URL="http://localhost:3000"

echo "=== Full Leaderboard ==="
curl -s "$BASE_URL/api/resident/leaderboard"

echo -e "\n=== Top 5 Societies ==="
curl -s "$BASE_URL/api/resident/leaderboard/top/5"

echo -e "\n=== Society Rank (Green Valley) ==="
curl -s "$BASE_URL/api/resident/leaderboard/society/Green%20Valley"

echo -e "\n=== Society Details ==="
curl -s "$BASE_URL/api/resident/societies/Green%20Valley"

echo -e "\n=== Society Tax Rebates ==="
curl -s "$BASE_URL/api/resident/societies/Green%20Valley/tax-rebates"
```

---

## Postman/Hoppscotch Collections

### Import Instructions

#### Postman
1. Open Postman
2. Click "Import" button
3. Select `testing/postman/genesis-backend.postman-collection.json`
4. Create environment with variables:
   - `baseUrl`: `http://localhost:3000`
   - `adminToken`: (leave empty, will be set by login)
   - `officerToken`: (leave empty)
   - `societyToken`: (leave empty)
   - `residentToken`: (leave empty)
   - `customerToken`: (leave empty)

#### Hoppscotch
1. Open Hoppscotch (hoppscotch.io)
2. Click "Import Collection"
3. Select `testing/hoppscotch/genesis-backend-hoppscotch.json`
3. Set base URL in environment variables

---

### Collection Files

| File | Description |
|------|-------------|
| `testing/postman/genesis-backend.postman-collection.json` | Full Postman collection |
| `testing/hoppscotch/genesis-backend-hoppscotch.json` | Hoppscotch collection |
| `testing/scripts/test-all.sh` | Complete automated test script |
| `testing/scripts/test-workflows.sh` | Workflow-specific tests |
| `testing/scripts/seed-test-data.sh` | Seed test data script |

---

## Troubleshooting

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| Login fails | Missing `.js` extension | Use correct import syntax |
| File upload fails | Missing directory | `mkdir -p uploads/officers uploads/verification` |
| MongoDB connection | Container not running | `docker-compose up -d` |
| 403 on login | Account not approved | Admin must approve account |
| Token expired | JWT expired | Re-login to get new token |
| Port in use | Process on 3000 | `lsof -ti:3000 | xargs kill -9` |

### Debug Commands

```bash
# Check MongoDB
docker-compose ps

# Check server logs
tail -f logs/app.log

# Verify file uploads
ls -la uploads/officers/

# Check environment
cat .env
```

---

## API Reference

### All Endpoints Summary

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/health` | No | Health check |
| POST | `/admin/login` | No | Admin login |
| GET | `/admin/pending-officers` | Admin | List pending officers |
| PUT | `/admin/approve-officer/:id` | Admin | Approve officer |
| DELETE | `/admin/reject-officer/:id` | Admin | Reject officer |
| GET | `/admin/pending-societies` | Admin | List pending societies |
| PUT | `/admin/approve-society/:id` | Admin | Approve society |
| DELETE | `/admin/reject-society/:id` | Admin | Reject society |
| GET | `/admin/societies` | Admin | List all societies |
| POST | `/api/officer/register` | No | Register officer |
| POST | `/api/officer/login` | No | Login officer |
| GET | `/api/officer/me` | Officer | Get profile |
| POST | `/api/resident/register` | No | Register resident |
| POST | `/api/resident/login` | No | Login resident |
| POST | `/api/society/register` | No | Register society |
| POST | `/api/society/login` | No | Login society |
| PATCH | `/api/society/society/compost-weight` | Society | Update compost |
| POST | `/api/customer/register` | No | Register customer |
| POST | `/api/customer/login` | No | Login customer |
| POST | `/api/verification/report/upload` | Society/Resident | Submit report |
| POST | `/api/verification/detect` | Auth | Process verification |
| GET | `/api/verification/reports/my` | Society/Resident | Get my reports |
| GET | `/api/bmc/pending-reviews` | Officer | Pending reviews |
| PATCH | `/api/bmc/review/:id` | Officer | Submit review |
| GET | `/api/bmc/officer/dashboard` | Officer | Dashboard stats |
| GET | `/api/resident/societies` | No | List societies |
| GET | `/api/resident/societies/:name` | No | Society details |
| GET | `/api/resident/societies/:name/reports` | No | Society reports |
| GET | `/api/resident/societies/:name/tax-rebates` | No | Tax rebates |
| GET | `/api/resident/leaderboard` | No | Full leaderboard |
| GET | `/api/resident/leaderboard/top/:n` | No | Top N societies |
| GET | `/api/resident/leaderboard/society/:name` | No | Society rank |

---

## Test Data Variables

Save these for reference:

```bash
ADMIN_TOKEN=eyJhbGciOiJIUzI1NiIs...
OFFICER_ID=...
OFFICER_TOKEN=...
SOCIETY_ID=...
SOCIETY_TOKEN=...
SOCIETY_ACCOUNT_ID=...
REPORT_ID=...
RESIDENT_ID=...
RESIDENT_TOKEN=...
CUSTOMER_ID=...
CUSTOMER_TOKEN=...
```

---

## Next Steps

1. ✅ Test all 5 roles (Admin, Officer, Society, Resident, Customer)
2. ✅ Test approval workflows (officer and society)
3. ✅ Test verification system with image uploads
4. ✅ Test BMC officer dashboard and review process
5. ✅ Test public leaderboard and society access
6. ✅ Test tax rebate calculations
7. Test IoT device integration (if implemented)
8. Test n8n webhook integration (if configured)

For API documentation, see: [API.md](API.md)
For development guidelines, see: [AGENTS.md](AGENTS.md)
