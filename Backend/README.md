# Genesis Backend - Smart City Management System

A comprehensive Node.js/Express/MongoDB backend for managing smart city operations including BMC officers, residents, societies, customers, and admin workflows.

## Architecture

### System Architecture
- **Microservices-based**: Modular design with separate controllers for each user role
- **RESTful API**: Standard HTTP methods and status codes
- **Role-Based Access Control (RBAC)**: Fine-grained permission system
- **Event-Driven**: IoT device integration and real-time verification
- **Scalable**: Designed for horizontal scaling with MongoDB

## Technology Stack

### Core Technologies
- **Runtime**: Bun (JavaScript runtime)
- **Web Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with role-based access control
- **Validation**: Zod schemas for request validation
- **File Upload**: Multer for document handling
- **Security**: bcrypt for password hashing, rate limiting

### Key Dependencies
- `bcrypt` - Password hashing
- `jsonwebtoken` - JWT token generation/verification
- `mongoose` - MongoDB object modeling
- `zod` - Schema validation and type inference
- `multer` - File upload handling
- `express-rate-limit` - API rate limiting
- `cors` - Cross-origin resource sharing
- `cookie-parser` - Cookie parsing middleware

## Project Structure

### Directory Structure
```
├── config/                 # Configuration files
│   ├── database.ts        # MongoDB connection
│   ├── roles_list.ts      # Role constants (admin:11, officer:12, resident:13, society:14, customer:15)
│   └── seeder.ts          # Admin seeder (DABS user)
├── controllers/           # Route handlers
│   ├── authController.ts    # Legacy auth (backward compat)
│   ├── officerController.ts # BMC Officer auth & profile
│   ├── residentController.ts# Resident auth & society management
│   ├── societyController.ts # Society worker auth
│   ├── customerController.ts# Customer auth & addresses
│   └── adminController.ts   # Admin management & approvals
├── middleware/            # Express middleware
│   ├── auth.ts            # JWT verification
│   ├── authorize.ts        # Role-based authorization
│   ├── upload.ts           # File upload for officer documents
│   ├── rateLimiter.ts      # Rate limiting
│   ├── validate.ts         # Zod validation
│   └── errorHandler.ts     # Global error handling
├── models/               # Mongoose models
│   └── User.ts            # Enhanced user model with role-specific fields
├── routes/               # Express route definitions
│   ├── officer.ts         # /api/officer/* routes
│   ├── resident.ts        # /api/resident/* routes
│   ├── society.ts         # /api/society/* routes
│   ├── customer.ts        # /api/customer/* routes
│   ├── admin.ts           # /admin/* routes
│   └── auth.ts            # Legacy routes
├── utils/                # Helper functions
│   ├── jwt.ts             # JWT token utilities
│   └── validation.ts      # Zod validation schemas
├── src/                  # Main application
│   └── app.ts             # Express app setup
├── uploads/              # File storage for officer documents
│   └── officers/         # Temporary storage until approval
├── types/                # Shared TypeScript types
└── docker-compose.yml    # MongoDB container
```

## Role-Based Authentication System

### User Roles
- **Admin (11)**: System administrators with approval powers
- **Officer (12)**: BMC officers requiring document verification
- **Resident (13)**: Society residents
- **Society (14)**: Society workers (managers, staff) requiring approval
- **Customer (15)**: Marketplace customers

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

## Database Schema

### User Collection
- **Role-based fields**: Each role has specific fields (documentType, societyId, addresses, etc.)
- **Approval workflows**: isVerified flag for officer and society accounts
- **Email uniqueness**: Compound index {email: 1, role: 1} allows same email across roles
- **Security**: Password hashing, JWT tokens with role information

#### Authentication Flow
1. **Register**: Create user account with role-specific data
2. **Login**: JWT token generation with role information
3. **Protected Routes**: Middleware verification using token
4. **Authorization**: Role-based access control middleware

## Installation and Setup

### Prerequisites
- **Bun Runtime** - Install from https://bun.sh/
- **Docker** - For MongoDB container
- **Environment Variables** - Configure in `.env` file

### Quick Start

1. **Clone and Install Dependencies**
   ```bash
   git clone <repository-url>
   cd Genesis/Backend
   bun install
   ```

2. **Set Up Environment Variables**
   Create `.env` file in root directory:
   ```
   MONGODB_URI=mongodb://localhost:27017/genesis
   PORT=3000
   JWT_SECRET=your-super-secret-jwt-key-change-in-production
   NODE_ENV=development
   ```

3. **Start MongoDB**
   ```bash
   docker-compose up -d
   ```

4. **Run Development Server**
   ```bash
   bun run dev
   ```

5. **Run Production Server**
   ```bash
   bun run start
   ```

## API Documentation

### Base URL
```
http://localhost:3000/api
```

### Authentication Headers
All protected routes require JWT token in Authorization header:
```
Authorization: Bearer <token>
```

The token contains role information for authorization.

### Error Response Format
```json
{
  "success": false,
  "message": "Error description",
  "error": "Optional error details"
}
```

### Success Response Format
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { /* response data */ }
}
```

## Development Workflow

### Code Style Guidelines

#### TypeScript Imports (CRITICAL)
**Always use `type` keyword for type-only imports** - enforced by `verbatimModuleSyntax`:

```typescript
// ✅ CORRECT
import type { Request, Response } from "express";
import { generateToken, type TokenPayload } from "../utils/jwt.js";

// ❌ WRONG - causes verbatimModuleSyntax error
import { Request, Response } from "express";
```

#### File Extensions
Always use `.js` extension in imports, even for TypeScript files:

```typescript
// ✅ CORRECT
import User from "../models/User.js";
import authRoutes from "../routes/auth.js";
```

#### Controller Pattern
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

#### Response Format
Standard API response structure:
```typescript
// Success
{ success: true, message: "...", data: { ... } }

// Error
{ success: false, message: "...", error?: "..." }
```

### Naming Conventions
- **Files**: camelCase for utilities, PascalCase for models (e.g., `userController.ts`, `User.ts`)
- **Functions**: camelCase (e.g., `getUserById`)
- **Interfaces**: PascalCase with `I` prefix for Mongoose documents (e.g., `IUserDocument`)
- **Types**: PascalCase (e.g., `TokenPayload`, `RegisterInput`)
- **Constants**: UPPER_SNAKE_CASE for config values

### Build Commands

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

## Testing Procedures

### Unit Testing
- Test individual controllers and middleware
- Test validation schemas
- Test authentication flows

### Integration Testing
- Test API endpoints with different roles
- Test approval workflows
- Test file upload functionality

### Manual Testing
- Test all role-specific endpoints
- Test approval workflows end-to-end
- Test IoT device integration (when implemented)

## Deployment Guide

### Environment Configuration
1. **Set up environment variables**
   ```bash
   # Production-specific variables
   NODE_ENV=production
   JWT_SECRET=strong-random-secret-key
   JWT_EXPIRE=24h
   MONGODB_URI=mongodb://production-db:27017/genesis
   ```

2. **Database setup**
   - Configure production MongoDB
   - Set up proper indexes
   - Configure backups

3. **Security considerations**
   - Use HTTPS in production
   - Implement proper CORS policies
   - Rate limiting and security headers

### Deployment Steps

1. **Build the application**
   ```bash
   bun run build
   ```

2. **Start the production server**
   ```bash
   bun run start
   ```

3. **Monitor the application**
   - Set up logging
   - Monitor database connections
   - Set up health checks

### Production Considerations

#### Scaling
- Use load balancer for horizontal scaling
- Implement connection pooling for MongoDB
- Use CDN for static assets

#### Monitoring
- Set up application monitoring
- Monitor database performance
- Set up error tracking

#### Security
- Regular security audits
- Update dependencies regularly
- Implement proper access controls

## IoT Integration Points

The system includes IoT device management capabilities:

### IoT Device Registration
- Devices register with unique hardware IDs
- Linked to specific societies
- Support for vibration sensors, cameras, meters, gateways

### Real-time Data Processing
- Device heartbeat monitoring
- Online/offline status tracking
- GPS location tracking
- Firmware version management

### Integration with Verification
- IoT data used in proof of life verification
- Vibration detection for activity monitoring
- AI-powered trust scoring

## AI-Powered Verification

The system includes AI-powered verification capabilities:

### Proof of Life Verification
- Photo evidence submission
- GPS metadata validation
- IoT sensor data correlation
- AI trust scoring

### Approval Workflows
- Automated initial screening
- Officer review process
- Rebate calculation
- Audit trail maintenance

## Contributing Guidelines

### Development Workflow
1. Fork the repository
2. Create feature branch
3. Make changes following code style guidelines
4. Test thoroughly
5. Submit pull request

### Code Quality
- Follow TypeScript strict mode
- Use proper error handling
- Write comprehensive tests
- Follow existing code patterns

### Security
- Never commit secrets or API keys
- Validate all inputs
- Use proper authentication and authorization
- Regular security audits

## Support and Maintenance

### Documentation
- Keep API documentation updated
- Maintain code comments
- Update README with new features

### Bug Reports
- Use GitHub issues for bug reports
- Include reproduction steps
- Provide error logs and stack traces

### Feature Requests
- Use GitHub issues for feature requests
- Provide use case and requirements
- Discuss with maintainers

---

**Genesis Backend** - Building smarter communities through technology integration and automation.


Update get /admin/pending-officer route to send images uploaded by officers as well
