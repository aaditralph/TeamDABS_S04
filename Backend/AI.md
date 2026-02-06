# AI Assistant Guide - Genesis Backend

> **For AI Models**: This document helps you understand and work with this codebase effectively.

## Project Overview

A Node.js backend built with:
- **Runtime**: Bun (v1.3.3+)
- **Framework**: Express.js with TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (jsonwebtoken) + bcrypt
- **Validation**: Zod
- **Architecture**: MVC pattern with middleware

## Quick Context

- **Entry Point**: `index.ts` - Bootstraps server and DB connection
- **App Config**: `src/app.ts` - Express app setup and middleware
- **Routes**: Mounted in `src/app.ts` under `/api/*` prefix
- **Auth Required**: Protected routes use `protect` middleware

## File Structure

```
├── config/
│   ├── database.ts          # MongoDB connection logic
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
│   ├── auth.ts              # JWT verification middleware
│   ├── authorize.ts         # Role-based authorization middleware
│   ├── upload.ts            # File upload for officer documents
│   ├── rateLimiter.ts       # Rate limiting middleware
│   └── validate.ts          # Zod validation middleware
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
├── src/app.ts               # Express app configuration
├── index.ts                 # Server entry point
└── docker-compose.yml       # MongoDB container setup
```

## Key Patterns

### 1. TypeScript Imports
Always use `type` keyword for type-only imports:
```typescript
// ✅ CORRECT
import type { Request, Response } from "express";
import type { TokenPayload } from "../utils/jwt.js";

// ❌ WRONG - causes verbatimModuleSyntax error
import { Request, Response } from "express";
```

### 2. Async Route Handlers
Controllers use async/await with explicit void return:
```typescript
export const handler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // logic here
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Error"
    });
  }
};
```

### 3. Protected Routes
Use the `protect` middleware for authentication:
```typescript
import { protect } from "../middleware/auth.js";

router.get("/protected", protect, handler);
```

### 4. Zod Validation
Apply validation middleware before controllers:
```typescript
import { validate } from "../middleware/validate.js";
import { someSchema } from "../utils/validation.js";

router.post("/endpoint", validate(someSchema), handler);
```

### 5. Response Format
Standard API response structure:
```typescript
// Success
{
  success: true,
  message: "Operation successful",
  data: { ... }
}

// Error
{
  success: false,
  message: "Error description",
  error?: "Error name"
}
```

## Environment Variables

Required in `.env`:
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/genesis
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d
NODE_ENV=development
```

## Common Tasks

### Adding a New Route

1. **Create Controller** in `controllers/`:
```typescript
// controllers/itemController.ts
import type { Request, Response } from "express";

export const getItems = async (req: Request, res: Response): Promise<void> => {
  // implementation
};
```

2. **Create Route** in `routes/`:
```typescript
// routes/items.ts
import { Router } from "express";
import { getItems } from "../controllers/itemController.js";
import { protect } from "../middleware/auth.js";

const router = Router();
router.get("/", protect, getItems);
export default router;
```

3. **Register Route** in `src/app.ts`:
```typescript
import itemRoutes from "../routes/items.js";
// ... other imports

app.use("/api/items", itemRoutes);
```

### Adding a New Model

1. Create in `models/` following this pattern:
```typescript
import mongoose from "mongoose";

export interface IItemDocument extends mongoose.Document {
  name: string;
  // add fields
  createdAt: Date;
  updatedAt: Date;
}

const ItemSchema = new mongoose.Schema<IItemDocument>(
  {
    name: { type: String, required: true },
    // field definitions
  },
  { timestamps: true }
);

export default mongoose.model<IItemDocument>("Item", ItemSchema);
```

### Adding Validation Schema

Add to `utils/validation.ts`:
```typescript
export const itemSchema = z.object({
  name: z.string().min(1, "Name is required"),
  // more fields
});

export type ItemInput = z.infer<typeof itemSchema>;
```

## Authentication Flow

### Legacy Routes (Still Available)
1. **Register**: `POST /api/auth/register` → Returns JWT token
2. **Login**: `POST /api/auth/login` → Returns JWT token
3. **Protected Route**: Include header `Authorization: Bearer <token>`
4. **Get User**: `GET /api/auth/me` (with token)

### Role-Based Routes

**Officer (role: 12) - Requires Approval:**
1. `POST /api/officer/register` with document upload → Account created (isVerified: false)
2. Admin approves via `PUT /admin/approve-officer/:id` → Document deleted, isVerified: true
3. `POST /api/officer/login` → Returns JWT with role
4. `GET /api/officer/me` → Get profile

**Resident (role: 13) - No Approval:**
1. `POST /api/resident/register` → Can login immediately
2. `POST /api/resident/login` → Returns JWT with role
3. `GET /api/resident/me` → Get profile
4. `PUT /api/resident/society` → Update society info

**Society Worker (role: 14) - Requires Approval:**
1. `POST /api/society/register` → Account created (isVerified: false)
2. Admin approves via `PUT /admin/approve-society/:id` → isVerified: true
3. `POST /api/society/login` → Returns JWT with role
4. `GET /api/society/me` → Get profile

**Customer (role: 15) - No Approval:**
1. `POST /api/customer/register` with address → Can login immediately
2. `POST /api/customer/login` → Returns JWT with role
3. `GET /api/customer/me` → Get profile
4. `PUT /api/customer/address` → Update addresses

**Admin (role: 11):**
1. Auto-created on startup: DABS/123
2. `POST /admin/login` → Returns JWT with admin role
3. Manage approvals: pending-officers, approve-officer, reject-officer
4. Manage societies: pending-societies, approve-society, reject-society, societies

The JWT payload contains: `{ userId: string, email: string, role: number }`

## Error Handling

All errors are caught by the global error handler in `middleware/errorHandler.ts`:
- Development: Shows stack traces
- Production: Hides stack traces

In controllers, always handle errors and send JSON response:
```typescript
try {
  // operation
} catch (error) {
  res.status(500).json({
    success: false,
    message: error instanceof Error ? error.message : "Unknown error"
  });
}
```

## Database Connection

MongoDB connection is handled automatically at startup:
- Connection code: `config/database.ts`
- Called in: `index.ts` before starting server
- Failure exits process with code 1

## Security Considerations

- Passwords hashed with bcrypt (salt rounds: 10)
- JWT secret must be strong in production
- CORS enabled for all origins (configure for production)
- Password field excluded from queries by default (`select: false`)

## Development Commands

```bash
# Install dependencies
bun install

# Run with auto-reload
bun run dev

# Run production build
bun run start

# Type check
bun run typecheck  # if configured
```

## Common Issues & Fixes

### "verbatimModuleSyntax" Error
Add `type` keyword to imports:
```typescript
import type { Something } from "module";
```

### MongoDB Connection Fails
- Check if MongoDB is running
- Verify MONGODB_URI in .env
- Check network connectivity

### JWT Errors
- Verify JWT_SECRET is set
- Check token expiration
- Ensure "Bearer " prefix in Authorization header

## Testing API Endpoints

Example with curl:

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

## Package Scripts

From `package.json`:
- `bun run dev` - Development with watch mode
- `bun run start` - Production start

## TypeScript Configuration

- Strict mode enabled
- Path aliases: Not configured (use relative imports)
- Module: ESNext with Node resolution
- Verbatim module syntax: Enforced

## Dependencies to Know

**Core:**
- `express` - Web framework
- `mongoose` - MongoDB ODM
- `jsonwebtoken` - JWT handling
- `bcrypt` - Password hashing
- `zod` - Schema validation
- `multer` - File upload middleware

**Utilities:**
- `cors` - CORS middleware
- `cookie-parser` - Cookie parsing
- `dotenv` - Environment variables
- `express-rate-limit` - Rate limiting

## File Upload Pattern

Officers must upload verification documents during registration:

```typescript
import { upload } from "../middleware/upload.js";

router.post("/register", upload.single("document"), register);

// In controller:
const documentUrl = req.file?.path; // Path to uploaded file
```

**Storage:** Files saved to `/uploads/officers/{timestamp}_officer_{filename}`
**Max Size:** 5MB
**Allowed Types:** PDF, JPG, PNG
**Cleanup:** Deleted after admin approval

## Role-Based Authorization

Restrict routes to specific roles using the authorize middleware:

```typescript
import { authorize } from "../middleware/authorize.js";

// Allow only admin
router.get("/admin-only", protect, authorize([11]), handler);

// Allow officer and resident
router.get("/shared", protect, authorize([12, 13]), handler);
```

## Environment Variables

Required in `.env`:
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/genesis
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d
NODE_ENV=development
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880
```

## Notes for AI Models

1. **Always check imports** - Use `type` for types due to verbatimModuleSyntax
2. **Follow existing patterns** - Look at role-specific controllers as examples
3. **Use proper error handling** - Always wrap in try/catch
4. **Maintain type safety** - Define interfaces for all data structures
5. **Keep it simple** - This is meant to be easy to understand and modify
6. **Test routes** - Verify new endpoints work with curl or Postman
7. **Update this doc** - If you add major features, document them here
8. **Role-specific fields** - Check User model for optional fields per role
9. **File cleanup** - Always delete officer docs after admin approval
10. **Compound index** - Email is unique per role, not globally
11. **Approval required** - Officer and Society cannot login until verified

## Need Help?

Check these files for reference implementations:
- `controllers/authController.ts` - Full CRUD with auth
- `routes/auth.ts` - Route mounting and middleware chain
- `middleware/auth.ts` - JWT verification pattern
- `models/User.ts` - Mongoose model with methods
- `config/roles_list.ts` - Role constants reference
