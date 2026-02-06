# Genesis Backend - API Documentation

## Overview

This document provides comprehensive API documentation for the Genesis Backend system, including all endpoints, request/response formats, authentication requirements, and error handling.

## Authentication

### JWT Token Structure
All protected routes require JWT token in `Authorization: Bearer <token>` header. The token payload includes:

```typescript
interface TokenPayload {
  userId: string;    // User ID
  email: string;     // User email
  role: number;      // Role number (11-15)
}
```

### Role-Based Access Control
- **Admin** (11): Full system access
- **Officer** (12): BMC operations, verification reviews
- **Resident** (13): Society management, profile access
- **Society** (14): Proof of life submissions, profile access
- **Customer** (15): Marketplace access, address management

## API Endpoints

### Base URL
- Development: `http://localhost:3000`
- Production: (to be configured)

### Authentication Endpoints

#### User Registration

**Officer Registration**
```http
POST /api/officer/register
Content-Type: multipart/form-data
```

**Request Body:**
```json
{
  "name": "John Officer",
  "email": "officer@test.com",
  "password": "password123",
  "phone": "1234567890",
  "documentType": "Aadhar"
}
```

**File Upload:**
- Field: `document`
- Type: PDF, JPG, PNG
- Max size: 5MB

**Response:**
```json
{
  "success": true,
  "message": "Officer registered successfully. Awaiting admin approval.",
  "data": {
    "user": {
      "id": "user_id",
      "name": "John Officer",
      "email": "officer@test.com",
      "phone": "1234567890",
      "role": 12,
      "isVerified": false,
      "documentType": "Aadhar"
    }
  }
}
```

**Resident Registration**
```http
POST /api/resident/register
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Jane Resident",
  "email": "resident@test.com",
  "password": "password123",
  "phone": "1234567890",
  "societyName": "Green Valley",
  "flatNumber": "A-101",
  "buildingName": "Building 1"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Resident registered successfully",
  "data": {
    "token": "jwt_token",
    "user": {
      "id": "user_id",
      "name": "Jane Resident",
      "email": "resident@test.com"
    }
  }
}
```

**Society Registration**
```http
POST /api/society/register
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Society Manager",
  "email": "society@test.com",
  "password": "password123",
  "phone": "1234567890",
  "societyName": "Green Valley Society",
  "address": {
    "street": "123 Main St",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400001"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Society worker registered successfully. Awaiting admin approval.",
  "data": {
    "user": {
      "id": "user_id",
      "name": "Society Manager",
      "email": "society@test.com",
      "phone": "1234567890",
      "role": 14,
      "isVerified": false,
      "societyName": "Green Valley Society"
    }
  }
}
```

**Customer Registration**
```http
POST /api/customer/register
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Customer User",
  "email": "customer@test.com",
  "password": "password123",
  "phone": "1234567890",
  "addresses": [
    {
      "street": "456 Market St",
      "city": "Mumbai",
      "state": "Maharashtra",
      "pincode": "400001",
      "landmark": "Near Park",
      "isDefault": true
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Customer registered successfully",
  "data": {
    "token": "jwt_token",
    "user": {
      "id": "user_id",
      "name": "Customer User",
      "email": "customer@test.com"
    }
  }
}
```

#### User Login

**Generic Login**
```http
POST /api/auth/login
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "user@test.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "jwt_token",
    "user": {
      "id": "user_id",
      "name": "User Name",
      "email": "user@test.com"
    }
  }
}
```

**Admin Login**
```http
POST /admin/login
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "DABS",
  "password": "123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "jwt_token",
    "user": {
      "id": "admin_id",
      "name": "DABS",
      "email": "DABS",
      "role": 11,
      "isSuperAdmin": true
    }
  }
}
```

### Profile Management

#### Get Current User
```http
GET /api/{role}/me
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "name": "User Name",
      "email": "user@test.com",
      "phone": "1234567890",
      "role": 12,
      "isVerified": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

#### Update Profile
```http
PUT /api/{role}/profile
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "New Name"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "user": {
      "id": "user_id",
      "name": "New Name",
      "email": "user@test.com",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T12:00:00.000Z"
    }
  }
}
```

#### Change Password
```http
PUT /api/{role}/change-password
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

### Resident-Specific Endpoints

#### Update Society Information
```http
PUT /api/resident/society
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "societyName": "New Society Name",
  "flatNumber": "B-202",
  "buildingName": "Building 2"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Society information updated successfully",
  "data": {
    "user": {
      "id": "user_id",
      "societyName": "New Society Name",
      "flatNumber": "B-202",
      "buildingName": "Building 2"
    }
  }
}
```

### Customer-Specific Endpoints

#### Update Address
```http
PUT /api/customer/address
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "street": "789 New St",
  "city": "Mumbai",
  "state": "Maharashtra",
  "pincode": "400002",
  "landmark": "Near Mall",
  "isDefault": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Address updated successfully",
  "data": {
    "addresses": [
      {
        "street": "789 New St",
        "city": "Mumbai",
        "state": "Maharashtra",
        "pincode": "400002",
        "landmark": "Near Mall",
        "isDefault": true
      }
    ]
  }
}
```

### Admin Endpoints

#### Get Pending Officers
```http
GET /admin/pending-officers
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "officers": [
      {
        "_id": "officer_id",
        "name": "John Officer",
        "email": "officer@test.com",
        "phone": "1234567890",
        "role": 12,
        "isVerified": false,
        "documentType": "Aadhar",
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

#### Approve Officer
```http
PUT /admin/approve-officer/:id
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Officer approved successfully",
  "data": {
    "officer": {
      "id": "officer_id",
      "name": "John Officer",
      "email": "officer@test.com",
      "isVerified": true,
      "verificationDate": "2024-01-01T12:00:00.000Z"
    }
  }
}
```

#### Reject Officer
```http
DELETE /admin/reject-officer/:id
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Officer rejected and removed"
}
```

#### Get Pending Societies
```http
GET /admin/pending-societies
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "societies": [
      {
        "_id": "society_id",
        "name": "Society Manager",
        "email": "society@test.com",
        "phone": "1234567890",
        "role": 14,
        "isVerified": false,
        "societyName": "Green Valley Society",
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

#### Approve Society
```http
PUT /admin/approve-society/:id
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Society worker approved successfully",
  "data": {
    "society": {
      "id": "society_id",
      "name": "Society Manager",
      "email": "society@test.com",
      "isVerified": true,
      "verificationDate": "2024-01-01T12:00:00.000Z"
    }
  }
}
```

#### Reject Society
```http
DELETE /admin/reject-society/:id
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Society worker rejected and removed"
}
```

#### Get All Societies
```http
GET /admin/societies
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "societies": [
      {
        "_id": "society_id",
        "name": "Society Manager",
        "email": "society@test.com",
        "phone": "1234567890",
        "role": 14,
        "isVerified": true,
        "societyName": "Green Valley Society",
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

### BMC Officer Endpoints

#### Get Pending Reviews
```http
GET /api/bmc/pending-reviews
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Pending reviews retrieved successfully",
  "data": {
    "count": 5,
    "submissions": [
      {
        "evidenceId": "evidence_id",
        "submissionDate": "2024-01-01T10:00:00.000Z",
        "society": {
          "id": "society_id",
          "societyName": "Green Valley Society",
          "email": "society@test.com",
          "phone": "1234567890"
        },
        "photoUrl": "https://example.com/photo.jpg",
        "gpsMetadata": {
          "latitude": 19.0760,
          "longitude": 72.8777,
          "accuracy": 10,
          "timestamp": "2024-01-01T10:00:00.000Z"
        },
        "aiTrustScore": 0.85,
        "iotVibrationStatus": "DETECTED",
        "verificationStatus": "PENDING"
      }
    ]
  }
}
```

#### Submit Review
```http
PUT /api/bmc/submit-review/:id
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "action": "APPROVE",
  "comments": "Verified and approved",
  "rebateAmount": 500
}
```

**Response:**
```json
{
  "success": true,
  "message": "Submission approved successfully",
  "data": {
    "evidenceId": "evidence_id",
    "verificationStatus": "APPROVED",
    "reviewTimestamp": "2024-01-01T12:00:00.000Z",
    "rebateAmount": 500
  }
}
```

#### Get Reports History
```http
GET /api/bmc/reports/history/:societyId
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Reports history retrieved successfully",
  "data": {
    "societyId": "society_id",
    "societyName": "Green Valley Society",
    "totalSubmissions": 10,
    "dailyLogs": {
      "2024-01-01": [
        {
          "evidenceId": "evidence_id",
          "submissionDate": "2024-01-01T10:00:00.000Z",
          "photoUrl": "https://example.com/photo.jpg",
          "gpsMetadata": {
            "latitude": 19.0760,
            "longitude": 72.8777,
            "accuracy": 10,
            "timestamp": "2024-01-01T10:00:00.000Z"
          },
          "aiTrustScore": 0.85,
          "iotVibrationStatus": "DETECTED",
          "verificationStatus": "APPROVED",
          "officerComments": "Verified and approved",
          "rebateAmount": 500,
          "reviewTimestamp": "2024-01-01T12:00:00.000Z"
        }
      ]
    }
  }
}
```

### Verification Endpoints

#### Submit Proof of Life
```http
POST /api/verification/proof-of-life
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "societyId": "society_id",
  "photoUrl": "https://example.com/photo.jpg",
  "gpsMetadata": {
    "latitude": 19.0760,
    "longitude": 72.8777,
    "accuracy": 10,
    "timestamp": "2024-01-01T10:00:00.000Z"
  },
  "iotVibrationData": {
    "deviceId": "device_id",
    "vibrationDetected": true,
    "timestamp": "2024-01-01T10:00:00.000Z"
  }
}
```

**Response:**
```json
{
  "success": true,
  "status": "PENDING_VERIFICATION",
  "message": "Logic placeholder - verification engine not yet implemented",
  "data": {
    "submittedAt": "2024-01-01T10:00:00.000Z",
    "requestId": "REQ-1234567890",
    "nextSteps": [
      "Validate geofence boundaries",
      "Calculate AI trust score",
      "Match IoT vibration data",
      "Compute final verification status"
    ]
  }
}
```

## Error Handling

### Standard Error Response
```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error (optional)"
}
```

### Common Error Codes

#### 400 - Bad Request
- Invalid request format
- Validation errors
- Missing required fields

#### 401 - Unauthorized
- Invalid credentials
- Expired token
- Missing authentication

#### 403 - Forbidden
- Account not approved
- Insufficient permissions
- Role-based access denied

#### 404 - Not Found
- Resource not found
- Invalid ID
- Endpoint not found

#### 409 - Conflict
- Email already exists
- Resource conflict

#### 422 - Unprocessable Entity
- File upload errors
- Validation failures

#### 500 - Internal Server Error
- Server errors
- Database connection issues
- Unexpected errors

## Rate Limiting

### Authentication Endpoints
- **Limit**: 5 requests per minute
- **Purpose**: Prevent brute force attacks

### General Endpoints
- **Limit**: 100 requests per minute
- **Purpose**: Prevent abuse

## File Upload

### Officer Document Upload
- **Endpoint**: `POST /api/officer/register`
- **Field**: `document`
- **Types**: PDF, JPG, PNG
- **Max Size**: 5MB
- **Storage**: `/uploads/officers/`
- **Cleanup**: Deleted after admin approval

## Database Operations

### User Operations
- **Create**: Register new users
- **Read**: Get user profiles
- **Update**: Update user information
- **Delete**: Remove users (admin only)

### IoT Device Operations
- **Register**: Add new devices
- **Update**: Update device status
- **Read**: Get device information
- **Delete**: Remove devices

### Evidence Operations
- **Submit**: Submit proof of life
- **Review**: Officer review process
- **Approve/Reject**: Final decision
- **Audit**: Track all changes

## Security Considerations

### Authentication
- JWT tokens with role claims
- Password hashing with bcrypt
- Rate limiting for authentication
- Session management

### Authorization
- Role-based access control
- Permission checks on endpoints
- Resource ownership validation

### Data Protection
- Input validation with Zod
- SQL injection prevention
- XSS protection
- File upload security

### API Security
- HTTPS enforcement
- CORS configuration
- API key management (future)
- Audit logging

## Testing Endpoints

### Health Check
```bash
curl http://localhost:3000/health
```

### Example Requests
```bash
# Officer Registration
curl -X POST http://localhost:3000/api/officer/register \
  -F "name=John Officer" \
  -F "email=officer@test.com" \
  -F "password=password123" \
  -F "phone=1234567890" \
  -F "documentType=Aadhar" \
  -F "document=@/path/to/document.pdf"

# Officer Login
curl -X POST http://localhost:3000/api/officer/login \
  -H "Content-Type: application/json" \
  -d '{"email":"officer@test.com","password":"password123"}'

# Admin Login
curl -X POST http://localhost:3000/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"DABS","password":"123"}'
```

---

**Genesis Backend API** - Comprehensive documentation for all endpoints and functionality
