# AGENTS.md - Genesis Backend

Guidelines for AI agents working on this Node.js/Express/MongoDB backend.

## Build Commands

```bash
# Install dependencies
bun install

# Run development server with auto-reload
bun run dev

# Run production server
bun start

# Start MongoDB (Docker)
docker-compose up -d

# Type checking
bun x tsc --noEmit

# Start MongoDB without Docker (if local MongoDB installed)
mongod --dbpath /path/to/data

# Test MongoDB connection
mongosh --eval "db.runCommand({ ping: 1 })"
```

**Note:** This project uses Bun runtime, not Node.js. Always use `bun` instead of `npm` or `node`.

## Code Style Guidelines

### TypeScript Imports (CRITICAL)

**Always use `type` keyword for type-only imports** - enforced by `verbatimModuleSyntax`:

```typescript
// ✅ CORRECT
import type { Request, Response } from "express";
import { generateToken, type TokenPayload } from "../utils/jwt.js";

// ❌ WRONG - causes verbatimModuleSyntax error
import { Request, Response } from "express";
```

### File Extensions

Always use `.js` extension in imports, even for TypeScript files:
```typescript
// ✅ CORRECT
import User from "../models/User.js";
import authRoutes from "../routes/auth.js";

// ❌ WRONG
import User from "../models/User";
import authRoutes from "../routes/auth";
```

### Controller Pattern

```typescript
export const handlerName = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Logic here
    res.status(200).json({
      success: true,
      message: "Operation successful",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error message",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
```

### Response Format

Standard API response structure:
```typescript
// Success
{ success: true, message: "...", data: { ... } }

// Error
{ success: false, message: "...", error?: "..." }
```

### Naming Conventions

- **Files:** camelCase for utilities, PascalCase for models (e.g., `userController.ts`, `User.ts`)
- **Functions:** camelCase (e.g., `getUserById`)
- **Interfaces:** PascalCase with `I` prefix for Mongoose documents (e.g., `IUserDocument`)
- **Types:** PascalCase (e.g., `TokenPayload`, `RegisterInput`)
- **Constants:** UPPER_SNAKE_CASE for config values
- **Routes:** kebab-case (e.g., `pending-reviews`, `tax-rebates`)

### Error Handling

- Always wrap controller logic in try/catch
- Use early returns after sending responses
- Return `Promise<void>` from async handlers
- Include specific error messages for 400/401/404 errors
- Generic 500 errors with `error instanceof Error` check
- Use proper HTTP status codes (200, 201, 400, 401, 403, 404, 500)

### Mongoose Models

```typescript
export interface IModelDocument extends mongoose.Document {
  field: string;
  createdAt: Date;
  updatedAt: Date;
  methodName(): Promise<ReturnType>;
}

const ModelSchema = new mongoose.Schema<IModelDocument>(
  { /* fields */ },
  { timestamps: true }
);

export default mongoose.model<IModelDocument>("Model", ModelSchema);
```

### Validation (Zod)

```typescript
export const schemaName = z.object({
  field: z.string().min(2, "Field must be at least 2 characters"),
});

export type SchemaInput = z.infer<typeof schemaName>;
```

### Protected Routes

```typescript
router.get("/protected", protect, handler);
router.post("/endpoint", validate(schema), handler);
```

### Multer File Uploads

When handling file uploads, use the exported multer configurations:

```typescript
import { upload, uploadVerification, handleUploadError } from "../middleware/upload.js";

// For officer documents
router.post("/register", upload.single("document"), handleUploadError, register);

// For verification images (meter/composter)
router.post("/report", uploadVerification.fields([
  { name: "meter_image", maxCount: 1 },
  { name: "composter_image", maxCount: 1 },
]), handler);
```

### Default Exports

Every service and module should have a default export for proper module resolution:

```typescript
// ✅ CORRECT - services must have default export
export default {
  functionName,
  anotherFunction,
};

// ❌ WRONG - causes module import errors
export {
  functionName,
  anotherFunction,
};
```

## Project Structure

```
Genesis/
├── Backend/
│   ├── config/
│   │   ├── database.ts          # MongoDB connection
│   │   ├── roles_list.ts        # Role constants (admin:11, officer:12, resident:13, society:14, customer:15)
│   │   ├── seeder.ts            # Admin seeder (DABS user auto-creation)
│   │   └── verification.ts      # Verification config (thresholds, expiry days, n8n webhook URL)
│   ├── controllers/
│   │   ├── adminController.ts      # Admin management & approvals
│   │   ├── authController.ts       # Legacy auth (backward compat)
│   │   ├── bmcController.ts        # BMC officer dashboard & report review
│   │   ├── customerController.ts   # Customer auth & addresses
│   │   ├── officerController.ts    # BMC Officer auth & profile
│   │   ├── residentController.ts   # Resident routes (public society access, leaderboard)
│   │   ├── societyController.ts    # Society worker auth & profile
│   │   └── verificationController.ts # Verification report submission & processing
│   ├── middleware/
│   │   ├── auth.ts              # JWT verification
│   │   ├── authorize.ts         # Role-based authorization middleware
│   │   ├── errorHandler.ts      # Global error handling
│   │   ├── rateLimiter.ts       # Rate limiting
│   │   ├── upload.ts            # File upload (officer docs, verification images)
│   │   └── validate.ts          # Zod validation middleware
│   ├── models/
│   │   ├── EvidenceLog.ts       # IoT device evidence logs
│   │   ├── IoTDevice.ts         # IoT device management
│   │   ├── Report.ts            # Report model with verification & rebate data
│   │   ├── SocietyAccount.ts    # Society account with tax/rebate fields
│   │   └── User.ts              # User model with role-specific fields
│   ├── routes/
│   │   ├── admin.ts             # /admin/* routes
│   │   ├── api/                 # Additional API routes
│   │   │   ├── marketRoutes.ts      # Marketplace routes
│   │   │   ├── officerRoutes.ts     # Officer-specific routes
│   │   │   ├── residentRoutes.ts    # Resident-specific routes
│   │   │   └── societyRoutes.ts      # Society-specific routes
│   │   ├── bmc.ts               # /api/bmc/* routes (officer dashboard)
│   │   ├── customer.ts          # /api/customer/* routes
│   │   ├── n8nWebhook.ts        # /api/n8n-callback (n8n workflow response)
│   │   ├── officer.ts           # /api/officer/* routes
│   │   ├── publicSociety.ts     # Public society routes (no auth required)
│   │   ├── reports.ts           # /api/reports/* routes
│   │   ├── resident.ts          # /api/resident/* routes (leaderboard, society access)
│   │   ├── society.ts           # /api/society/* routes
│   │   └── verification.ts      # /api/verification/* routes
│   ├── services/
│   │   ├── detectionService.ts      # Python script execution for detection
│   │   ├── n8nService.ts           # n8n webhook triggers
│   │   ├── notificationService.ts    # In-app notifications
│   │   ├── schedulerService.ts      # Auto-processing expired reports
│   │   └── index.ts                 # Service exports
│   ├── uploads/
│   │   ├── officers/           # Officer document uploads (temp until approval)
│   │   └── verification/       # Verification images (meter/composter)
│   ├── src/
│   │   └── app.ts              # Express app setup
│   ├── types/                   # Shared TypeScript types (TODO: populate)
│   ├── utils/
│   │   ├── jwt.ts              # JWT token generation & verification
│   │   └── validation.ts       # Zod validation schemas
│   ├── python/                 # Python scripts for AI detection
│   ├── index.ts                # Entry point
│   ├── docker-compose.yml      # MongoDB container
│   └── tsconfig.json          # TypeScript configuration
├── Admin-Frontend/             # BMC Officer dashboard frontend
├── BMC/                       # BMC-related documentation/config
├── society_app/               # Society management mobile app
├── auth_app/                  # Authentication app
├── marketplace/               # Marketplace directory
├── Recommendation Workflow/   # n8n workflow configurations
├── Weights/                   # AI model weights
├── images/                    # Project images
└── python_script/            # Python detection scripts
```

## Role-Based Authentication System

### 5 User Roles (config/roles_list.ts)
- **Admin** (11) - System administrators with approval powers (auto-created: DABS/123)
- **Officer** (12) - BMC officers requiring document verification
- **Resident** (13) - Public access to society data (no login required)
- **Society** (14) - Society workers (managers, staff) requiring approval
- **Customer** (15) - Marketplace customers

### Authenticated Routes
```
/api/officer/register     # With document upload
/api/officer/login
/api/officer/me           # Protected

/api/society/register     # Requires approval
/api/society/login
/api/society/me           # Protected
/society/compost-weight    # Update daily compost weight

/api/customer/register
/api/customer/login
/api/customer/me          # Protected

/api/bmc/pending-reviews
/api/bmc/review/:id       # Approve/reject reports
/api/bmc/officer/dashboard
```

### Public Routes (No Auth Required)
```
/api/resident/societies                    # List all verified societies
/api/resident/societies/:name             # Society details
/api/resident/societies/:name/reports     # Society reports
/api/resident/societies/:name/tax-rebates  # Tax rebate history
/api/resident/leaderboard                  # Gamified rankings
/api/resident/leaderboard/top/:n           # Top N societies
/api/resident/leaderboard/society/:name    # Society's rank
```

### Approval Workflows
- **Officers**: Register with document → Stored in /uploads/officers/ → Admin approves → Document deleted → Can login
- **Society Workers**: Register → Admin approves → Can login
- **Residents & Customers**: No approval needed, immediate access (residents now have public access)
- **Admin**: Auto-created on startup (DABS/123), no registration endpoint

### Email Uniqueness
Email is unique per role (compound index: {email: 1, role: 1}), allowing one person to have multiple roles.

## Leaderboard Gamification

The leaderboard ranks societies based on three metrics:

```
overallScore = (avgVerificationScore × 0.5) + (consistencyScore × 0.3) + (complianceBonus × 0.2)
```

| Component | Weight | Formula |
|-----------|--------|---------|
| Average Verification Score | 50% | Mean of all verification probabilities |
| Consistency Score | 30% | (ApprovedReports / TotalReports) × 100 |
| Compliance Bonus | 20% | ComplianceStreak × 2 |

## Tax Rebate Calculation

```
rebateAmount = propertyTaxEstimate × 0.05 × (approvedDays / 365)
```

Reports expire after 7 days:
- **>= 50% probability**: AUTO_APPROVED with rebate
- **< 50% probability**: AUTO_REJECTED

## Testing Endpoints

```bash
# Health check
curl http://localhost:3000/health

# Society Registration
curl -X POST http://localhost:3000/api/society/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Manager",
    "email": "manager@society.com",
    "password": "password123",
    "phone": "9876543210",
    "societyName": "Green Valley",
    "address": {"street": "123 Main", "city": "Mumbai", "state": "Maharashtra", "pincode": "400001"},
    "geoLockCoordinates": {"latitude": 19.0760, "longitude": 72.8777},
    "propertyTaxEstimate": 500000,
    "electricMeterSerialNumber": "EM-2024-12345"
  }'

# Society Login
curl -X POST http://localhost:3000/api/society/login \
  -H "Content-Type: application/json" \
  -d '{"email":"manager@society.com","password":"password123"}'

# Submit Verification Report (with images)
curl -X POST http://localhost:3000/api/verification/report/upload \
  -H "Authorization: Bearer <token>" \
  -F "meter_image=@meter.jpg" \
  -F "composter_image=@composter.jpg"

# Officer Registration (with document)
curl -X POST http://localhost:3000/api/officer/register \
  -F "name=John Officer" \
  -F "email=officer@bmc.gov.in" \
  -F "password=password123" \
  -F "phone=9876543210" \
  -F "documentType=Aadhar" \
  -F "document=@document.pdf"

# Public Leaderboard
curl http://localhost:3000/api/resident/leaderboard

# Public Society Reports
curl http://localhost:3000/api/resident/societies/Green%20Valley/reports

# Admin Login (DABS/123 auto-created)
curl -X POST http://localhost:3000/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"DABS","password":"123"}'

# Approve Officer (admin)
curl -X PUT http://localhost:3000/admin/approve-officer/OFFICER_ID \
  -H "Authorization: Bearer ADMIN_TOKEN"

# Approve Report (officer)
curl -X PATCH http://localhost:3000/api/bmc/review/REPORT_ID \
  -H "Authorization: Bearer OFFICER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"action":"APPROVE","comments":"Verified"}'
```

## Key Reminders

- **Runtime:** Bun (not Node.js or npm)
- **Database:** MongoDB via Docker Compose
- **Auth:** JWT tokens in `Authorization: Bearer <token>` header (includes role number)
- **Import rule:** Use `.js` extensions and `type` keyword for types
- **Strict TypeScript:** Strict mode enabled, no unchecked indexed access
- **Environment:** Check `.env` for required variables
- **Roles:** 5 roles - Admin(11), Officer(12), Resident(13), Society(14), Customer(15)
- **Residents:** No login required - public access to all society data
- **File Upload:** Officers (PDF/JPG/PNG, 5MB), Verification (JPG/PNG/WebP, 10MB)
- **n8n Integration:** Set `N8N_WEBHOOK_URL` in `.env` for automated verification
- **Compliance Streak:** Incremented when reports are approved; resets if no report submitted
- **Email Uniqueness:** Email is unique per role, allowing same email across different roles
- **Document Cleanup:** Officer documents are deleted from filesystem after admin approval

## Pending Tasks

### Backend
- [ ] Populate `types/` directory with shared TypeScript types
- [ ] Create `routes/auth.ts` for legacy authentication routes (if needed)
- [ ] Add proper types for EvidenceLog, IoTDevice models
- [ ] Integrate routes/api/* with main route files or document separately
- [ ] Add validation schemas for all endpoints in utils/validation.ts

### General
- [ ] Complete Python AI detection scripts in python/ directory
- [ ] Set up Weights/ directory with trained models
- [ ] Configure Recommendation Workflow n8n templates
- [ ] Complete Admin-Frontend dashboard
- [ ] Complete society_app mobile app
- [ ] Complete auth_app authentication app
- [ ] Set up marketplace directory

## Common Issues

1. **"verbatimModuleSyntax" error** → Add `type` keyword to imports
2. **MongoDB connection fails** → Run `docker-compose up -d`
3. **Module not found** → Use `.js` extension in import paths
4. **Missing return type** → Add `Promise<void>` to async handlers
5. **Officer cannot login** → Check if admin has approved the account
6. **File upload fails** → Ensure uploads/ directory exists with write permissions
7. **Email already exists** → Email is unique per role
8. **"default" export missing** → Add default export to services
9. **n8n callback fails** → Verify `N8N_WEBHOOK_URL` is set in `.env`
