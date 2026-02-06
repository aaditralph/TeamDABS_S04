# API Documentation: Admin Endpoints

This document details the API endpoints for system administrators (Role: 11). All protected routes require a valid JWT in the \`Authorization: Bearer <token>\` header, and access is restricted to Admin users.

## Authentication

### 1. Admin Login

| Field | Value |
| :--- | :--- |
| **Endpoint** | \`POST /admin/login\` |
| **Description** | Authenticates an admin user (DABS is auto-created). Rate-limited. |
| **Auth** | None |
| **Request Body** | \`application/json\`
\`\`\`json
{
  "email": "DABS",
  "password": "123"
}
\`\`\`|
| **Success Response** | \`200 OK\` (\`application/json\`)
\`\`\`json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "...",
    "user": {
      "id": "...",
      "name": "...",
      "email": "...",
      "role": 11,
      "isSuperAdmin": true
    }
  }
}
\`\`\`|
| **Error Response** | \`401 Unauthorized\` (\`application/json\`)
\`\`\`json
{
  "success": false,
  "message": "Invalid credentials"
}
\`\`\`|

## Officer Management (Pending Verification)

### 2. Get Pending Officers

| Field | Value |
| :--- | :--- |
| **Endpoint** | \`GET /admin/pending-officers\` |
| **Description** | Retrieves a list of officers who have registered but are not yet verified. |
| **Auth** | Admin (Role 11) |
| **Success Response** | \`200 OK\` (\`application/json\`)
\`\`\`json
{
  "success": true,
  "data": {
    "officers": [
      {
        "_id": "...",
        "name": "...",
        "email": "...",
        "phone": "...",
        "role": 12,
        "isVerified": false,
        "documentType": "Aadhar",
        "documentUrl": "/path/to/file.pdf"
      }
    ]
  }
}
\`\`\`|

### 3. Get Officer Verification Document

| Field | Value |
| :--- | :--- |
| **Endpoint** | \`GET /admin/officer-document/:id\` |
| **Description** | **New Feature:** Sends the uploaded verification document (PDF/JPG/PNG) for the specified officer ID. |
| **Auth** | Admin (Role 11) |
| **Params** | \`:id\` - The MongoDB ID of the officer. |
| **Success Response** | \`200 OK\` - Streams the document file (e.g., \`Content-Type: application/pdf\`) as a download. |
| **Error Response** | \`404 Not Found\` (\`application/json\`)
\`\`\`json
{
  "success": false,
  "message": "Officer not found"
}
\`\`\`|

### 4. Approve Officer

| Field | Value |
| :--- | :--- |
| **Endpoint** | \`PUT /admin/approve-officer/:id\` |
| **Description** | Marks an officer as verified (\`isVerified: true\`) and deletes their uploaded document from the filesystem. |
| **Auth** | Admin (Role 11) |
| **Params** | \`:id\` - The MongoDB ID of the officer to approve. |
| **Success Response** | \`200 OK\` (\`application/json\`)
\`\`\`json
{
  "success": true,
  "message": "Officer approved successfully",
  "data": {
    "officer": {
      "id": "...",
      "name": "...",
      "email": "...",
      "isVerified": true,
      "verificationDate": "2026-02-06T..."
    }
  }
}
\`\`\`|
| **Error Response** | \`404 Not Found\` (\`application/json\`)
\`\`\`json
{
  "success": false,
  "message": "Officer not found or already approved"
}
\`\`\`|

### 5. Reject Officer

| Field | Value |
| :--- | :--- |
| **Endpoint** | \`DELETE /admin/reject-officer/:id\` |
| **Description** | Deletes the officer's account and their uploaded document. |
| **Auth** | Admin (Role 11) |
| **Params** | \`:id\` - The MongoDB ID of the officer to reject. |
| **Success Response** | \`200 OK\` (\`application/json\`)
\`\`\`json
{
  "success": true,
  "message": "Officer rejected and removed"
}
\`\`\`|
| **Error Response** | \`404 Not Found\` (\`application/json\`)
\`\`\`json
{
  "success": false,
  "message": "Officer not found"
}
\`\`\`|

## Society Management

### 6. Get Pending Societies

| Field | Value |
| :--- | :--- |
| **Endpoint** | \`GET /admin/pending-societies\` |
| **Description** | Retrieves a list of society workers who have registered but are not yet verified. |
| **Auth** | Admin (Role 11) |
| **Success Response** | \`200 OK\` (\`application/json\`)
\`\`\`json
{
  "success": true,
  "data": {
    "societies": [
      {
        "_id": "...",
        "name": "...",
        "email": "...",
        "role": 14,
        "isVerified": false,
        "societyName": "Green Valley"
      }
    ]
  }
}
\`\`\`|

### 7. Approve Society

| Field | Value |
| :--- | :--- |
| **Endpoint** | \`PUT /admin/approve-society/:id\` |
| **Description** | Marks a society worker as verified (\`isVerified: true\`). |
| **Auth** | Admin (Role 11) |
| **Params** | \`:id\` - The MongoDB ID of the society worker to approve. |
| **Success Response** | \`200 OK\` (\`application/json\`)
\`\`\`json
{
  "success": true,
  "message": "Society worker approved successfully",
  "data": {
    "society": {
      "id": "...",
      "name": "...",
      "email": "...",
      "isVerified": true,
      "verificationDate": "2026-02-06T..."
    }
  }
}
\`\`\`|
| **Error Response** | \`404 Not Found\` (\`application/json\`)
\`\`\`json
{
  "success": false,
  "message": "Society worker not found or already approved"
}
\`\`\`|

### 8. Reject Society

| Field | Value |
| :--- | :--- |
| **Endpoint** | \`DELETE /admin/reject-society/:id\` |
| **Description** | Deletes the society worker's account. |
| **Auth** | Admin (Role 11) |
| **Params** | \`:id\` - The MongoDB ID of the society worker to reject. |
| **Success Response** | \`200 OK\` (\`application/json\`)
\`\`\`json
{
  "success": true,
  "message": "Society worker rejected and removed"
}
\`\`\`|
| **Error Response** | \`404 Not Found\` (\`application/json\`)
\`\`\`json
{
  "success": false,
  "message": "Society worker not found"
}
\`\`\`|

### 9. Get All Verified Societies

| Field | Value |
| :--- | :--- |
| **Endpoint** | \`GET /admin/societies\` |
| **Description** | Retrieves a list of all verified and active society worker accounts. |
| **Auth** | Admin (Role 11) |
| **Success Response** | \`200 OK\` (\`application/json\`)
\`\`\`json
{
  "success": true,
  "data": {
    "societies": [
      {
        "_id": "...",
        "name": "...",
        "email": "...",
        "role": 14,
        "isVerified": true,
        "societyName": "Green Valley",
        "createdAt": "2026-02-06T...",
        "updatedAt": "2026-02-06T..."
      }
    ]
  }
}
\`\`\`|
