# AGENTS.md - Genesis Backend

Guidelines for AI agents working on this Node.js/Express/MongoDB backend.

## Build Commands

```bash
# Install dependencies
bun install

# Run development server with auto-reload
bun run dev

# Run production server
bun run start

# Start MongoDB (Docker)
docker-compose up -d

# Type checking (via TypeScript)
bun x tsc --noEmit
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

### Error Handling

- Always wrap controller logic in try/catch
- Use early returns after sending responses
- Return Promise<void> from async handlers
- Include specific error messages for 400/401/404 errors
- Generic 500 errors with `error instanceof Error` check

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

## Project Structure

```
├── config/
│   ├── database.ts          # MongoDB connection
│   ├── roles_list.ts        # Role constants (admin:11, officer:12, resident:13, society:14, customer:15)
│   └── seeder.ts            # Admin seeder (DABS user)
├── controllers/
│   ├── officerController.ts    # BMC Officer auth & profile
│   ├── residentController.ts   # Resident auth & society management
│   ├── societyController.ts    # Society worker auth
│   ├── customerController.ts   # Customer auth & addresses
│   ├── adminController.ts      # Admin management & approvals
│   └── authController.ts       # Legacy auth (backward compat)
├── middleware/
│   ├── auth.ts              # JWT verification
│   ├── authorize.ts         # Role-based authorization middleware
│   ├── upload.ts            # File upload for officer documents
│   ├── rateLimiter.ts       # Rate limiting
│   ├── validate.ts          # Zod validation
│   └── errorHandler.ts      # Global error handling
├── models/
│   └── User.ts              # Enhanced user model with role-specific fields
├── routes/
│   ├── officer.ts           # /api/officer/* routes
│   ├── resident.ts          # /api/resident/* routes
│   ├── society.ts           # /api/society/* routes
│   ├── customer.ts          # /api/customer/* routes
│   ├── admin.ts             # /admin/* routes
│   └── auth.ts              # Legacy routes
├── uploads/                 # File storage for officer documents
│   └── officers/            # Temporary storage until approval
├── types/                   # Shared TypeScript types
├── utils/                   # Helper functions
├── src/app.ts               # Express app setup
├── index.ts                 # Entry point
└── docker-compose.yml       # MongoDB container
```

## Role-Based Authentication System

### 5 User Roles (config/roles_list.ts)
- **Admin** (11) - System administrators with approval powers (auto-created: DABS/123)
- **Officer** (12) - BMC officers requiring document verification
- **Resident** (13) - Society residents
- **Society** (14) - Society workers (managers, staff) requiring approval
- **Customer** (15) - Marketplace customers

### Route Structure by Role
```
/api/officer/register     # With document upload
/api/officer/login
/api/officer/me           # Protected

/api/resident/register
/api/resident/login
/api/resident/me          # Protected
/api/resident/society     # PUT - Update society (protected)

/api/society/register     # Requires approval
/api/society/login
/api/society/me           # Protected

/api/customer/register
/api/customer/login
/api/customer/me          # Protected
/api/customer/address     # PUT - Update address (protected)

/admin/login              # Admin login only
/admin/pending-officers   # GET - List pending (protected, admin only)
/admin/approve-officer/:id # PUT - Approve officer
/admin/reject-officer/:id # DELETE - Reject officer
/admin/pending-societies  # GET - List pending societies
/admin/approve-society/:id # PUT - Approve society
/admin/reject-society/:id # DELETE - Reject society
/admin/societies          # GET - List all verified societies
```

### Approval Workflows
- **Officers**: Register with document → Stored in /uploads/officers/ → Admin approves → Document deleted → Can login
- **Society Workers**: Register → Admin approves → Can login
- **Residents & Customers**: No approval needed, immediate access
- **Admin**: Auto-created on startup (DABS/123), no registration endpoint

### Email Uniqueness
Email is unique per role (compound index: {email: 1, role: 1}), allowing one person to have multiple roles.

## Testing Endpoints

```bash
# Health check
curl http://localhost:3000/health

# Officer Registration (with document upload)
curl -X POST http://localhost:3000/api/officer/register \
  -F "name=John Officer" \
  -F "email=officer@test.com" \
  -F "password=password123" \
  -F "phone=1234567890" \
  -F "documentType=Aadhar" \
  -F "document=@/path/to/document.pdf"

# Officer Login (only works after admin approval)
curl -X POST http://localhost:3000/api/officer/login \
  -H "Content-Type: application/json" \
  -d '{"email":"officer@test.com","password":"password123"}'

# Resident Registration
curl -X POST http://localhost:3000/api/resident/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane Resident","email":"resident@test.com","password":"password123","phone":"1234567890","societyName":"Green Valley","flatNumber":"A-101"}'

# Admin Login (DABS user auto-created)
curl -X POST http://localhost:3000/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"DABS","password":"123"}'

# Get pending officers (admin only)
curl http://localhost:3000/admin/pending-officers \
  -H "Authorization: Bearer ADMIN_TOKEN"

# Approve officer (admin only)
curl -X PUT http://localhost:3000/admin/approve-officer/OFFICER_ID \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

## Key Reminders

- **Runtime:** Bun (not Node.js)
- **Database:** MongoDB via Docker Compose
- **Auth:** JWT tokens in `Authorization: Bearer <token>` header (includes role number)
- **Import rule:** Use `.js` extensions and `type` keyword for types
- **Strict TypeScript:** Strict mode enabled, no unchecked indexed access
- **Environment:** Check `.env` for required variables
- **Roles:** 5 roles available - Admin(11), Officer(12), Resident(13), Society(14), Customer(15)
- **Approval Required:** Officer and Society accounts need admin approval before login
- **File Upload:** Officers require document upload (PDF/JPG/PNG, max 5MB) stored in /uploads/officers/
- **Email Uniqueness:** Email is unique per role, allowing same email across different roles
- **Document Cleanup:** Officer documents are deleted from filesystem after admin approval

## Common Issues

1. **"verbatimModuleSyntax" error** → Add `type` keyword to imports
2. **MongoDB connection fails** → Run `docker-compose up -d`
3. **Module not found** → Use `.js` extension in import paths
4. **Missing return type** → Add `Promise<void>` to async handlers
5. **Officer cannot login** → Check if admin has approved the account
6. **File upload fails** → Ensure uploads/officers/ directory exists and has write permissions
7. **Email already exists** → Remember email is unique per role, not globally
