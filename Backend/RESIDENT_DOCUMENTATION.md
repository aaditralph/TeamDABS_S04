# Resident & Gamification API Documentation

This document describes the API routes accessible to residents and the public for viewing society data, reports, tax rebates, and the gamified leaderboard.

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Access Society Reports](#access-society-reports)
3. [View Tax Rebates](#view-tax-rebates)
4. [Gamification Leaderboard](#gamification-leaderboard)
5. [Leaderboard Scoring Formula](#leaderboard-scoring-formula)
6. [Gamification Tips for Residents](#gamification-tips-for-residents)

---

## Quick Start

All routes are **public** (no authentication required). Simply call the endpoints:

```bash
# View all societies
curl http://localhost:3000/api/resident/societies

# Search for a specific society
curl http://localhost:3000/api/resident/societies/Green%20Valley%20Apartments

# View society reports
curl http://localhost:3000/api/resident/societies/Green%20Valley%20Apartments/reports

# Check the leaderboard
curl http://localhost:3000/api/resident/leaderboard

# See top 5 performing societies
curl http://localhost:3000/api/resident/leaderboard/top/5

# Find your society's rank
curl http://localhost:3000/api/resident/leaderboard/society/Green%20Valley%20Apartments
```

---

## Access Society Reports

### Get All Verified Societies

Returns a list of all registered and verified societies.

```
GET /api/resident/societies
```

#### Query Parameters

| Parameter | Type | Description | Default |
|----------|------|-------------|---------|
| `compostAvailable` | Boolean | Return only societies selling compost | - |

#### Example Request

```bash
curl -X GET "http://localhost:3000/api/resident/societies?compostAvailable=true"
```

#### Response (200 OK)

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
        "complianceStreak": 15,
        "lastComplianceDate": "2026-02-05T10:00:00.000Z"
      }
    ]
  }
}
```

---

### Get Society by Name

Returns detailed information about a specific society.

```
GET /api/resident/societies/:societyName
```

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `societyName` | String | Name of the society (case-insensitive) |

#### Example Request

```bash
curl -X GET "http://localhost:3000/api/resident/societies/Gley%20Apartments"
```

####reen%20Val Response (200 OK)

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

---

### Get Society Reports

Returns all reports submitted by a society, with optional filtering.

```
GET /api/resident/societies/:societyName/reports
```

#### Query Parameters

| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| `status` | String | Filter by status | - |
| `fromDate` | String | Start date (ISO 8601) | - |
| `toDate` | String | End date (ISO 8601) | - |
| `limit` | Number | Maximum results | 100 |

#### Status Values

| Status | Description |
|--------|-------------|
| `PENDING` | Awaiting review |
| `AUTO_APPROVED` | Auto-approved by system |
| `OFFICER_APPROVED` | Approved by officer |
| `REJECTED` | Rejected |

#### Example Request

```bash
curl -X GET "http://localhost:3000/api/resident/societies/Green%20Valley%20Apartments/reports?status=AUTO_APPROVED&limit=10"
```

#### Response (200 OK)

```json
{
  "success": true,
  "message": "Society reports retrieved successfully",
  "data": {
    "society": {
      "societyName": "Green Valley Apartments",
      "totalRebatesEarned": 15000.00,
      "averageVerificationScore": 78.5
    },
    "count": 10,
    "reports": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "submissionDate": "2026-02-06T10:30:00.000Z",
        "submissionImages": [
          {
            "url": "http://localhost:3000/uploads/verification/meter-abc123.png",
            "label": "meter_image"
          },
          {
            "url": "http://localhost:3000/uploads/verification/composter-xyz789.png",
            "label": "composter_image"
          }
        ],
        "gpsMetadata": {
          "latitude": 19.0760,
          "longitude": 72.8777,
          "accuracy": 10
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

#### Report Fields Description

| Field | Description |
|-------|-------------|
| `_id` | Unique report identifier |
| `submissionDate` | When the report was submitted |
| `submissionImages` | Uploaded meter and composter images |
| `gpsMetadata` | Geo-location where images were captured |
| `aiTrustScore` | AI confidence score (0-100) |
| `verificationProbability` | Verification probability (0-100) |
| `verificationStatus` | Current status |
| `rebateAmount` | Tax rebate earned (if approved) |
| `approvedDays` | Days from submission to approval |

---

### Get Single Report Details

Returns complete details of a specific report.

```
GET /api/resident/societies/:societyName/reports/:reportId
```

#### Example Request

```bash
curl -X GET "http://localhost:3000/api/resident/societies/Green%20Valley%20Apartments/reports/507f1f77bcf86cd799439011"
```

#### Response (200 OK)

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
      "submissionImages": [
        {
          "url": "http://localhost:3000/uploads/verification/meter-abc123.png",
          "label": "meter_image",
          "uploadedAt": "2026-02-06T10:30:00.000Z",
          "gpsMetadata": {
            "latitude": 19.0760,
            "longitude": 72.8777,
            "accuracy": 10,
            "timestamp": "2026-02-06T10:25:00.000Z"
          }
        },
        {
          "url": "http://localhost:3000/uploads/verification/composter-xyz789.png",
          "label": "composter_image",
          "uploadedAt": "2026-02-06T10:30:00.000Z"
        }
      ],
      "verificationImages": [],
      "gpsMetadata": {
        "latitude": 19.0760,
        "longitude": 72.8777,
        "accuracy": 10,
        "timestamp": "2026-02-06T10:30:00.000Z"
      },
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

## View Tax Rebates

### Get Society Tax Rebates

Returns all tax rebates earned by a society.

```
GET /api/resident/societies/:societyName/tax-rebates
```

#### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `fromDate` | String | Start date (ISO 8601) |
| `toDate` | String | End date (ISO 8601) |

#### Example Request

```bash
curl -X GET "http://localhost:3000/api/resident/societies/Green%20Valley%20Apartments/tax-rebates?fromDate=2026-01-01"
```

#### Response (200 OK)

```json
{
  "success": true,
  "message": "Tax rebates retrieved successfully",
  "data": {
    "society": {
      "societyName": "Green Valley Apartments",
      "propertyTaxEstimate": 500000
    },
    "summary": {
      "totalRebatesEarned": 15000.00,
      "totalApprovedReports": 45,
      "totalApprovedDays": 180,
      "averageRebatePerReport": 333.33
    },
    "rebates": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "submissionDate": "2026-02-06T10:30:00.000Z",
        "rebateAmount": 342.47,
        "approvedDays": 5,
        "verificationStatus": "AUTO_APPROVED",
        "approvalType": "AUTOMATIC"
      },
      {
        "_id": "507f1f77bcf86cd799439012",
        "submissionDate": "2026-02-05T10:30:00.000Z",
        "rebateAmount": 287.67,
        "approvedDays": 3,
        "verificationStatus": "OFFICER_APPROVED",
        "approvalType": "OFFICER"
      }
    ]
  }
}
```

#### Rebate Calculation Formula

```typescript
rebateAmount = propertyTaxEstimate × 0.05 × (approvedDays / 365)
```

#### Example Calculation

For a society with:
- Property Tax Estimate: ₹500,000
- Report approved in 5 days

```typescript
rebateAmount = 500,000 × 0.05 × (5 / 365)
            = 25,000 × 0.0137
            = ₹342.47
```

---

## Gamification Leaderboard

### Get Full Leaderboard

Returns rankings of all registered societies based on performance metrics.

```
GET /api/resident/leaderboard
```

#### Query Parameters

| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| `limit` | Number | Number of results to return | 50 |
| `offset` | Number | Number of results to skip | 0 |

#### Example Request

```bash
curl -X GET "http://localhost:3000/api/resident/leaderboard?limit=10&offset=0"
```

#### Response (200 OK)

```json
{
  "success": true,
  "message": "Leaderboard retrieved successfully",
  "data": {
    "count": 10,
    "total": 25,
    "leaderboard": [
      {
        "societyId": "507f1f77bcf86cd799439011",
        "societyName": "Green Valley Apartments",
        "totalReports": 45,
        "approvedReports": 42,
        "consistencyScore": 93.33,
        "averageVerificationScore": 82.5,
        "complianceStreak": 15,
        "totalRebatesEarned": 15000.00,
        "overallScore": 85,
        "rank": 1,
        "lastComplianceDate": "2026-02-05T10:00:00.000Z"
      },
      {
        "societyId": "507f1f77bcf86cd799439012",
        "societyName": "Sunrise Towers",
        "totalReports": 40,
        "approvedReports": 36,
        "consistencyScore": 90.0,
        "averageVerificationScore": 78.2,
        "complianceStreak": 12,
        "totalRebatesEarned": 12500.00,
        "overallScore": 78,
        "rank": 2,
        "lastComplianceDate": "2026-02-04T10:00:00.000Z"
      },
      {
        "societyId": "507f1f77bcf86cd799439013",
        "societyName": "Harmony Homes",
        "totalReports": 38,
        "approvedReports": 32,
        "consistencyScore": 84.21,
        "averageVerificationScore": 75.8,
        "complianceStreak": 8,
        "totalRebatesEarned": 9800.00,
        "overallScore": 71,
        "rank": 3,
        "lastComplianceDate": "2026-02-03T10:00:00.000Z"
      }
    ]
  }
}
```

#### Leaderboard Fields Description

| Field | Description |
|-------|-------------|
| `rank` | Current position on leaderboard |
| `societyName` | Name of the society |
| `overallScore` | Total gamification score (0-100) |
| `totalReports` | Total reports submitted |
| `approvedReports` | Reports that were approved |
| `consistencyScore` | Percentage of reports approved |
| `averageVerificationScore` | Mean verification probability |
| `complianceStreak` | Consecutive days with approved reports |
| `totalRebatesEarned` | Total tax rebates received (₹) |
| `lastComplianceDate` | Last date of approved report |

---

### Get Top N Societies

Returns the top performing societies.

```
GET /api/resident/leaderboard/top/:position
```

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `position` | Number | Number of top societies to return |

#### Example Request

```bash
curl -X GET "http://localhost:3000/api/resident/leaderboard/top/5"
```

#### Response (200 OK)

```json
{
  "success": true,
  "message": "Top 5 societies retrieved successfully",
  "data": {
    "count": 5,
    "leaderboard": [
      {
        "societyName": "Green Valley Apartments",
        "overallScore": 85,
        "rank": 1,
        "consistencyScore": 93.33,
        "averageVerificationScore": 82.5,
        "complianceStreak": 15,
        "totalRebatesEarned": 15000.00
      },
      {
        "societyName": "Sunrise Towers",
        "overallScore": 78,
        "rank": 2,
        "consistencyScore": 90.0,
        "averageVerificationScore": 78.2,
        "complianceStreak": 12,
        "totalRebatesEarned": 12500.00
      },
      {
        "societyName": "Harmony Homes",
        "overallScore": 71,
        "rank": 3,
        "consistencyScore": 84.21,
        "averageVerificationScore": 75.8,
        "complianceStreak": 8,
        "totalRebatesEarned": 9800.00
      }
    ]
  }
}
```

---

### Get Society's Rank

Returns a specific society's position on the leaderboard with comparison to neighbors.

```
GET /api/resident/leaderboard/society/:societyName
```

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `societyName` | String | Name of the society |

#### Example Request

```bash
curl -X GET "http://localhost:3000/api/resident/leaderboard/society/Green%20Valley%20Apartments"
```

#### Response (200 OK)

```json
{
  "success": true,
  "message": "Society rank retrieved successfully",
  "data": {
    "rank": 1,
    "totalSocieties": 25,
    "society": {
      "societyName": "Green Valley Apartments",
      "overallScore": 85,
      "totalReports": 45,
      "approvedReports": 42,
      "consistencyScore": 93.33,
      "averageVerificationScore": 82.5,
      "complianceStreak": 15,
      "totalRebatesEarned": 15000.00
    },
    "comparison": {
      "aboveAverage": null,
      "belowAverage": {
        "societyName": "Sunrise Towers",
        "rank": 2,
        "overallScore": 78
      }
    }
  }
}
```

---

## Leaderboard Scoring Formula

The overall score is calculated using three key performance indicators:

```
overallScore = (averageVerificationScore × 0.5) + (consistencyScore × 0.3) + (complianceBonus × 0.2)
```

### Component Breakdown

| Component | Weight | Description | How to Improve |
|-----------|--------|-------------|----------------|
| Average Verification Score | 50% | Mean of all verification probabilities | Submit clear, high-quality images |
| Consistency Score | 30% | Percentage of reports approved | Maintain daily submissions |
| Compliance Bonus | 20% | Consecutive approved days × 2 | Never miss a day of submission |

### Detailed Calculation

#### 1. Average Verification Score (50%)

```typescript
averageVerificationScore = Sum(verificationProbability) / ApprovedReports
```

**Tips for improvement:**
- Ensure good lighting for meter/composter photos
- Capture clear, readable meter readings
- Include the entire composter in the frame
- Ensure GPS metadata is accurate

#### 2. Consistency Score (30%)

```typescript
consistencyScore = (ApprovedReports / TotalReports) × 100
```

**Tips for improvement:**
- Submit reports daily without fail
- Avoid rejected reports by following guidelines
- Maintain a steady submission schedule

#### 3. Compliance Bonus (20%)

```typescript
complianceBonus = ComplianceStreak × 2
```

**Tips for improvement:**
- Submit reports every single day
- Build and maintain a long streak
- Even one missed day breaks the streak

### Example Calculation

For **Green Valley Apartments**:

| Metric | Value |
|--------|-------|
| Average Verification Score | 82.5 |
| Total Reports | 45 |
| Approved Reports | 42 |
| Compliance Streak | 15 days |

#### Step-by-Step Calculation

```typescript
// Component 1: Average Verification Score
const avgVerification = 82.5 × 0.5 = 41.25

// Component 2: Consistency Score
const consistency = (42 / 45) × 100 = 93.33
const consistencyWeighted = 93.33 × 0.3 = 28.0

// Component 3: Compliance Bonus
const compliance = 15 × 2 = 30
const complianceWeighted = 30 × 0.2 = 6.0

// Overall Score
overallScore = 41.25 + 28.0 + 6.0 = 75.25 → Rounded to 75
```

---

## Gamification Tips for Residents

### 🏆 How to Climb the Leaderboard

#### 1. Submit Daily Reports
- Consistency is key - submit every single day
- Set a daily reminder
- Early morning submissions work best

#### 2. High-Quality Images
- Good lighting is essential
- Ensure meter readings are clearly visible
- Include the entire composter in photos
- Verify GPS accuracy

#### 3. Maintain Your Streak
- Even one missed day resets your compliance bonus
- Plan ahead for holidays
- Delegate if you'll be unavailable

#### 4. Monitor Your Progress
```bash
# Check your society's rank
curl http://localhost:3000/api/resident/leaderboard/society/Your%20Society%20Name

# View detailed statistics
curl http://localhost:3000/api/resident/societies/Your%20Society%20Name/reports
```

#### 5. Learn from Top Performers
```bash
# See what the top 3 are doing right
curl http://localhost:3000/api/resident/leaderboard/top/3
```

---

## Leaderboard Tiers

Based on overall scores, societies fall into these tiers:

| Tier | Score Range | Description |
|------|------------|-------------|
| 🥇 Platinum | 80-100 | Elite performers |
| 🥈 Gold | 60-79 | High achievers |
| 🥉 Silver | 40-59 | Steady performers |
| 📋 Bronze | 20-39 | Building momentum |
| ⭐ Rookie | 0-19 | Just getting started |

---

## Sample Gamified Response

Here's a complete example of what a resident might see:

```json
{
  "success": true,
  "message": "Leaderboard retrieved successfully",
  "data": {
    "count": 3,
    "total": 25,
    "leaderboard": [
      {
        "societyId": "507f1f77bcf86cd799439011",
        "societyName": "Green Valley Apartments",
        "tier": "🥇 Platinum",
        "totalReports": 45,
        "approvedReports": 42,
        "consistencyScore": 93.33,
        "averageVerificationScore": 82.5,
        "complianceStreak": 15,
        "totalRebatesEarned": 15000.00,
        "overallScore": 85,
        "rank": 1,
        "lastComplianceDate": "2026-02-05T10:00:00.000Z"
      }
    ],
    "yourSociety": {
      "name": "Sunrise Towers",
      "rank": 2,
      "overallScore": 78,
      "tier": "🥈 Gold",
      "gapToNext": {
        "rank": 1,
        "name": "Green Valley Apartments",
        "scoreDifference": 7,
        "daysToCatchUp": "Keep submitting daily!"
      }
    }
  }
}
```

---

## Error Responses

All endpoints return standard error responses:

```json
{
  "success": false,
  "message": "Error description here",
  "error": "Technical error message"
}
```

### Common Error Codes

| Code | Message | Description |
|------|---------|-------------|
| 404 | Society not found | Society name doesn't exist |
| 404 | Report not found | Invalid report ID |
| 500 | Internal server error | Something went wrong |

---

## Rate Limits

No rate limits are enforced for public endpoints, but please be respectful.

---

## Summary

| Endpoint | Description | Auth Required |
|----------|-------------|---------------|
| `GET /api/resident/societies` | List all societies | ❌ No |
| `GET /api/resident/societies/:name` | Society details | ❌ No |
| `GET /api/resident/societies/:name/reports` | View reports | ❌ No |
| `GET /api/resident/societies/:name/reports/:id` | Single report | ❌ No |
| `GET /api/resident/societies/:name/tax-rebates` | View rebates | ❌ No |
| `GET /api/resident/leaderboard` | Full rankings | ❌ No |
| `GET /api/resident/leaderboard/top/:n` | Top N societies | ❌ No |
| `GET /api/resident/leaderboard/society/:name` | Society's rank | ❌ No |

---

## Quick Reference

```bash
# View all societies
curl http://localhost:3000/api/resident/societies

# Search for society
curl http://localhost:3000/api/resident/societies/Green%20Valley

# View reports
curl http://localhost:3000/api/resident/societies/Green%20Valley/reports

# Check rebates
curl http://localhost:3000/api/resident/societies/Green%20Valley/tax-rebates

# Leaderboard
curl http://localhost:3000/api/resident/leaderboard

# Top 10
curl http://localhost:3000/api/resident/leaderboard/top/10

# Your society's rank
curl http://localhost:3000/api/resident/leaderboard/society/Green%20Valley
```
