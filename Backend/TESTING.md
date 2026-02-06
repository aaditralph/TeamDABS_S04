# Testing Guide - Genesis Backend

Complete step-by-step guide to test the Genesis multi-role authentication system.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Quick Start](#quick-start)
3. [Testing by Role](#testing-by-role)
4. [Complete Workflows](#complete-workflows)
5. [Common Test Scenarios](#common-test-scenarios)
6. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### 1. Start MongoDB
```bash
docker-compose up -d
```

Verify it's running:
```bash
docker-compose ps
```

### 2. Install Dependencies
```bash
bun install
```

### 3. Start the Server
```bash
bun run dev
```

You should see:
```
MongoDB Connected: localhost
Server running on port 3000
Environment: development
Admin user created: DABS
```

### 4. Create Upload Directory
```bash
mkdir -p uploads/officers
```

---

## Quick Start

### Test Health Endpoint
```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2026-02-05T07:57:39.608Z",
  "uptime": 65.715938986
}
```

---

## Testing by Role

### 1. Admin (Role 11)

#### 1.1 Admin Login
```bash
curl -X POST http://localhost:3000/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"DABS","password":"123"}'
```

**Expected Response:**
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

Save the token as `ADMIN_TOKEN` for later use.

#### 1.2 Check Pending Officers (Initially Empty)
```bash
curl http://localhost:3000/admin/pending-officers \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "officers": []
  }
}
```

---

### 2. BMC Officer (Role 12)

#### 2.1 Create a Test Document
```bash
# Create a simple PDF for testing
echo "This is a test document for officer verification" > test_document.txt
```

#### 2.2 Register Officer
```bash
curl -X POST http://localhost:3000/api/officer/register \
  -F "name=John Officer" \
  -F "email=officer@example.com" \
  -F "password=password123" \
  -F "phone=1234567890" \
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
      "email": "officer@example.com",
      "phone": "1234567890",
      "role": 12,
      "isVerified": false
    }
  }
}
```

Save the officer ID as `OFFICER_ID`.

**Verify:** Check that file was uploaded:
```bash
ls uploads/officers/
```

#### 2.3 Try Login Before Approval (Should Fail)
```bash
curl -X POST http://localhost:3000/api/officer/login \
  -H "Content-Type: application/json" \
  -d '{"email":"officer@example.com","password":"password123"}'
```

**Expected Response (403):**
```json
{
  "success": false,
  "message": "Account pending admin approval"
}
```

#### 2.4 Admin Approves Officer

First, check pending officers:
```bash
curl http://localhost:3000/admin/pending-officers \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

You should see the officer in the list with `documentUrl`.

Approve the officer:
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

**Verify:** Document should be deleted:
```bash
ls uploads/officers/  # Should be empty
```

#### 2.5 Login After Approval (Should Succeed)
```bash
curl -X POST http://localhost:3000/api/officer/login \
  -H "Content-Type: application/json" \
  -d '{"email":"officer@example.com","password":"password123"}'
```

Save the token as `OFFICER_TOKEN`.

#### 2.6 Get Officer Profile
```bash
curl http://localhost:3000/api/officer/me \
  -H "Authorization: Bearer $OFFICER_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "...",
      "name": "John Officer",
      "email": "officer@example.com",
      "phone": "1234567890",
      "role": 12,
      "isVerified": true,
      "documentType": "Aadhar",
      "verificationDate": "..."
    }
  }
}
```

---

### 3. Resident (Role 13)

#### 3.1 Register Resident
```bash
curl -X POST http://localhost:3000/api/resident/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Resident",
    "email": "resident@example.com",
    "password": "password123",
    "phone": "9876543210",
    "societyName": "Green Valley",
    "flatNumber": "A-101",
    "buildingName": "Tower 1"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Resident registered successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "...",
      "name": "Jane Resident",
      "email": "resident@example.com",
      "phone": "9876543210",
      "role": 13,
      "societyName": "Green Valley",
      "flatNumber": "A-101",
      "isVerified": true
    }
  }
}
```

Save token as `RESIDENT_TOKEN`.

#### 3.2 Login (No Approval Needed)
```bash
curl -X POST http://localhost:3000/api/resident/login \
  -H "Content-Type: application/json" \
  -d '{"email":"resident@example.com","password":"password123"}'
```

#### 3.3 Get Resident Profile
```bash
curl http://localhost:3000/api/resident/me \
  -H "Authorization: Bearer $RESIDENT_TOKEN"
```

#### 3.4 Update Society
```bash
curl -X PUT http://localhost:3000/api/resident/society \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $RESIDENT_TOKEN" \
  -d '{
    "societyName": "Blue Heights",
    "flatNumber": "B-205",
    "buildingName": "Block B"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Society updated successfully",
  "data": {
    "user": {
      "societyName": "Blue Heights",
      "flatNumber": "B-205",
      "buildingName": "Block B"
    }
  }
}
```

---

### 4. Society Worker (Role 14)

#### 4.1 Register Society Worker
```bash
curl -X POST http://localhost:3000/api/society/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Mike Manager",
    "email": "manager@example.com",
    "password": "password123",
    "phone": "9876543210",
    "societyName": "Green Valley",
    "designation": "manager",
    "employeeId": "EMP001",
    "address": {
      "street": "123 Main Road",
      "city": "Mumbai",
      "state": "Maharashtra",
      "pincode": "400001"
    }
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
      "email": "manager@example.com",
      "role": 14,
      "isVerified": false
    }
  }
}
```

Save ID as `SOCIETY_ID`.

#### 4.2 Try Login Before Approval (Should Fail)
```bash
curl -X POST http://localhost:3000/api/society/login \
  -H "Content-Type: application/json" \
  -d '{"email":"manager@example.com","password":"password123"}'
```

**Expected Response (403):**
```json
{
  "success": false,
  "message": "Account pending admin approval"
}
```

#### 4.3 Admin Approves Society Worker

Check pending societies:
```bash
curl http://localhost:3000/admin/pending-societies \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

Approve:
```bash
curl -X PUT "http://localhost:3000/admin/approve-society/$SOCIETY_ID" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

#### 4.4 Login After Approval
```bash
curl -X POST http://localhost:3000/api/society/login \
  -H "Content-Type: application/json" \
  -d '{"email":"manager@example.com","password":"password123"}'
```

Save token as `SOCIETY_TOKEN`.

#### 4.5 Get Society Profile
```bash
curl http://localhost:3000/api/society/me \
  -H "Authorization: Bearer $SOCIETY_TOKEN"
```

---

### 5. Customer (Role 15)

#### 5.1 Register Customer
```bash
curl -X POST http://localhost:3000/api/customer/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alice Customer",
    "email": "customer@example.com",
    "password": "password123",
    "phone": "9876543210",
    "addresses": [{
      "street": "456 Park Street",
      "city": "Mumbai",
      "state": "Maharashtra",
      "pincode": "400002",
      "landmark": "Near Metro Station",
      "isDefault": true
    }]
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Customer registered successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "...",
      "name": "Alice Customer",
      "email": "customer@example.com",
      "role": 15,
      "isVerified": true
    }
  }
}
```

Save token as `CUSTOMER_TOKEN`.

#### 5.2 Login
```bash
curl -X POST http://localhost:3000/api/customer/login \
  -H "Content-Type: application/json" \
  -d '{"email":"customer@example.com","password":"password123"}'
```

#### 5.3 Get Customer Profile
```bash
curl http://localhost:3000/api/customer/me \
  -H "Authorization: Bearer $CUSTOMER_TOKEN"
```

#### 5.4 Update Address
```bash
curl -X PUT http://localhost:3000/api/customer/address \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CUSTOMER_TOKEN" \
  -d '{
    "street": "789 New Road",
    "city": "Pune",
    "state": "Maharashtra",
    "pincode": "411001",
    "landmark": "Near Mall",
    "isDefault": true
  }'
```

---

## Complete Workflows

### Workflow 1: Full Officer Approval Process

```bash
#!/bin/bash

# 1. Create test document
echo "ID Proof" > id_proof.txt

# 2. Register officer
echo "=== Registering Officer ==="
RESPONSE=$(curl -s -X POST http://localhost:3000/api/officer/register \
  -F "name=Test Officer" \
  -F "email=testofficer@example.com" \
  -F "password=password123" \
  -F "phone=1234567890" \
  -F "documentType=PAN" \
  -F "document=@id_proof.txt")

echo "Response: $RESPONSE"
OFFICER_ID=$(echo $RESPONSE | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
echo "Officer ID: $OFFICER_ID"

# 3. Try login (should fail)
echo -e "\n=== Trying login before approval ==="
curl -s -X POST http://localhost:3000/api/officer/login \
  -H "Content-Type: application/json" \
  -d '{"email":"testofficer@example.com","password":"password123"}'

# 4. Admin login
echo -e "\n\n=== Admin Login ==="
ADMIN_RESP=$(curl -s -X POST http://localhost:3000/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"DABS","password":"123"}')
ADMIN_TOKEN=$(echo $ADMIN_RESP | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
echo "Admin Token: $ADMIN_TOKEN"

# 5. Check pending officers
echo -e "\n=== Pending Officers ==="
curl -s http://localhost:3000/admin/pending-officers \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# 6. Approve officer
echo -e "\n\n=== Approving Officer ==="
curl -s -X PUT "http://localhost:3000/admin/approve-officer/$OFFICER_ID" \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# 7. Login after approval
echo -e "\n\n=== Login After Approval ==="
LOGIN_RESP=$(curl -s -X POST http://localhost:3000/api/officer/login \
  -H "Content-Type: application/json" \
  -d '{"email":"testofficer@example.com","password":"password123"}')
echo "$LOGIN_RESP"

# Cleanup
rm id_proof.txt
```

---

## Common Test Scenarios

### Scenario 1: Same Email, Different Roles

One person can register with the same email across multiple roles:

```bash
# Register as officer (needs approval)
curl -X POST http://localhost:3000/api/officer/register \
  -F "name=John" \
  -F "email=john@example.com" \
  -F "password=pass123" \
  -F "phone=123" \
  -F "documentType=Aadhar" \
  -F "document=@doc.txt"

# Register as resident (immediate access)
curl -X POST http://localhost:3000/api/resident/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John",
    "email": "john@example.com",
    "password": "pass123",
    "phone": "123",
    "societyName": "Test",
    "flatNumber": "101"
  }'
```

Both should succeed because email is unique per role.

### Scenario 2: Reject Officer

```bash
# 1. Create and register officer
# 2. Get officer ID
# 3. Admin rejects:
curl -X DELETE "http://localhost:3000/admin/reject-officer/$OFFICER_ID" \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# 4. Verify officer cannot login
curl -X POST http://localhost:3000/api/officer/login \
  -d '{"email":"officer@example.com","password":"password123"}'
# Should return 404 - User not found
```

### Scenario 3: Get All Societies

```bash
curl http://localhost:3000/admin/societies \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Verify:**
- No password fields in response
- Only verified societies shown
- Complete address information

---

## Troubleshooting

### Issue 1: "Cannot find module"
**Cause:** Missing .js extension in imports
**Solution:** Always use `.js` extension even for TypeScript files

### Issue 2: "Not authorized, no token"
**Cause:** Missing or malformed Authorization header
**Solution:** Use format: `-H "Authorization: Bearer TOKEN"`

### Issue 3: File upload fails
**Cause:** Upload directory doesn't exist
**Solution:** Run `mkdir -p uploads/officers`

### Issue 4: "Account pending admin approval"
**Cause:** Officer/Society not yet approved
**Solution:** Login as admin and approve the account

### Issue 5: MongoDB connection fails
**Cause:** Docker container not running
**Solution:**
```bash
docker-compose down
docker-compose up -d
```

### Issue 6: Port already in use
**Cause:** Another process using port 3000
**Solution:**
```bash
# Find and kill process
lsof -ti:3000 | xargs kill -9
```

---

## Quick Reference: All Endpoints

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/health` | GET | No | Health check |
| `/admin/login` | POST | No | Admin login |
| `/admin/pending-officers` | GET | Admin | List pending |
| `/admin/approve-officer/:id` | PUT | Admin | Approve officer |
| `/admin/reject-officer/:id` | DELETE | Admin | Reject officer |
| `/admin/pending-societies` | GET | Admin | List pending |
| `/admin/approve-society/:id` | PUT | Admin | Approve society |
| `/admin/reject-society/:id` | DELETE | Admin | Reject society |
| `/admin/societies` | GET | Admin | List all societies |
| `/api/officer/register` | POST | No | Register with doc |
| `/api/officer/login` | POST | No | Login |
| `/api/officer/me` | GET | Yes | Get profile |
| `/api/resident/register` | POST | No | Register |
| `/api/resident/login` | POST | No | Login |
| `/api/resident/me` | GET | Yes | Get profile |
| `/api/resident/society` | PUT | Yes | Update society |
| `/api/society/register` | POST | No | Register |
| `/api/society/login` | POST | No | Login |
| `/api/society/me` | GET | Yes | Get profile |
| `/api/customer/register` | POST | No | Register |
| `/api/customer/login` | POST | No | Login |
| `/api/customer/me` | GET | Yes | Get profile |
| `/api/customer/address` | PUT | Yes | Update address |

---

## Environment Variables for Testing

Create a `.env.test` file:
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/genesis_test
JWT_SECRET=test-secret-key
JWT_EXPIRE=7d
NODE_ENV=development
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880
```

Run with test database:
```bash
NODE_ENV=test bun run dev
```

---

## Next Steps

1. ✅ Test all 5 roles
2. ✅ Verify approval workflows
3. ✅ Test file upload and deletion
4. ✅ Verify email uniqueness per role
5. ✅ Test error handling and edge cases

For API reference, see: [API.md](API.md)
For development guidelines, see: [AGENTS.md](AGENTS.md)
