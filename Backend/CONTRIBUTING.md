# Genesis Backend - Contributing Guide

Welcome to the Genesis Backend project! This guide will help you understand how to contribute effectively to this smart society management system.

## Development Workflow

### 1. Setting Up Your Development Environment

#### Prerequisites
- **Bun Runtime**: Install Bun (https://bun.sh/)
- **Docker**: For MongoDB container
- **Node.js**: For development tools (optional, Bun is preferred)
- **Git**: Version control

#### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Genesis-Backend
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start MongoDB (Docker)**
   ```bash
   docker-compose up -d
   ```

5. **Start the development server**
   ```bash
   bun run dev
   ```

### 2. Code Style Guidelines

#### TypeScript Imports (CRITICAL)
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

### 3. Project Structure

```
Genesis Backend/
├── config/                    # Configuration files
├── controllers/              # Business logic controllers
├── middleware/               # Express middleware
├── models/                  # Mongoose models
├── routes/                  # API route definitions
├── utils/                   # Helper functions
├── uploads/                 # File storage
├── src/                     # Application entry point
├── scripts/                 # Database scripts
├── types/                   # Shared TypeScript types
├── .env                     # Environment variables
├── docker-compose.yml       # MongoDB container configuration
└── index.ts                 # Application entry point
```

### 4. Database Schema

#### User Model
```typescript
interface IUserDocument {
  name: string;
  email: string;           // Unique per role
  password: string;        // Hashed with bcrypt
  phone: string;
  role: number;            // 11-15 (admin/officer/resident/society/customer)
  isVerified: boolean;     // Approval status
  isActive: boolean;       // Account status
  societyId?: ObjectId;    // Linked society (residents)
  documentType?: string;   // Officer document type
  documentUrl?: string;    // Officer document path
  verificationDate?: Date; // Approval timestamp
  verifiedBy?: ObjectId;   // Admin who approved
  societyName?: string;    // Resident society info
  flatNumber?: string;     // Resident flat number
  addresses?: Address[];   // Customer addresses
  isSuperAdmin?: boolean;  // Admin flag
}
```

#### IoT Device Model
```typescript
interface IIoTDeviceDocument {
  deviceHardwareId: string;     // Unique hardware ID
  linkedSocietyId: ObjectId;    // Society owner
  deviceType: "VIBRATION_SENSOR" | "CAMERA" | "METER" | "GATEWAY";
  firmwareVersion: string;
  lastHeartbeat: Date;          // Last connection timestamp
  isOnline: boolean;            // Current status
  lastKnownLatitude?: number;   // GPS coordinates
  lastKnownLongitude?: number;
}
```

#### Evidence Log Model
```typescript
interface IEvidenceLogDocument {
  societyId: ObjectId;           // Society owner
  photoUrl: string;              // Photo evidence
  gpsMetadata: {
    latitude: number;
    longitude: number;
    accuracy: number;
    timestamp: Date;
  };
  aiTrustScore: number;          // AI verification score
  iotVibrationStatus: string;    // IoT sensor status
  verificationStatus: "PENDING" | "APPROVED" | "REJECTED";
  officerId?: ObjectId;          // Reviewing officer
  reviewTimestamp?: Date;        // Review timestamp
  officerComments?: string;      // Review comments
  rebateAmount?: number;         // Approved rebate
}
```

## Role-Based Authentication System

### 5 User Roles (config/roles_list.ts)
- **Admin** (11) - System administrators with approval powers (auto-created: DABS/123)
- **Officer** (12) - BMC officers requiring document verification
- **Resident** (13) - Society residents
- **Society** (14) - Society workers (managers, staff) requiring approval
- **Customer** (15) - Marketplace customers

### Approval Workflows
- **Officers**: Register with document → Stored in /uploads/officers/ → Admin approves → Document deleted → Can login
- **Society Workers**: Register → Admin approves → Can login
- **Residents & Customers**: No approval needed, immediate access
- **Admin**: Auto-created on startup (DABS/123), no registration endpoint

### Email Uniqueness
Email is unique per role (compound index: {email: 1, role: 1}), allowing one person to have multiple roles.

## Testing

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

### Testing Commands
```bash
# Type checking (via TypeScript)
bun x tsc --noEmit

# Run development server with auto-reload
bun run dev

# Run production server
bun run start

# Start MongoDB (Docker)
docker-compose up -d
```

## Git Workflow

### Branch Strategy
- **main**: Production-ready code
- **develop**: Development branch
- **feature/**: Feature branches
- **bugfix/**: Bug fix branches

### Commit Messages
Follow conventional commit format:
```
feat: add new officer registration endpoint
fix: resolve document upload validation issue
test: add unit tests for authentication middleware
```

### Pull Request Process
1. Create feature branch from develop
2. Make changes following code style guidelines
3. Add comprehensive tests
4. Ensure all tests pass
5. Submit pull request to develop branch
6. Code review by maintainers
7. Merge after approval

## Code Quality

### TypeScript Configuration
- Strict mode enabled
- No unchecked indexed access
- Type-only imports enforced
- Path aliases configured

### Error Handling
- Always wrap controller logic in try/catch
- Use early returns after sending responses
- Include specific error messages for 400/401/404 errors
- Generic 500 errors with `error instanceof Error` check

### Validation
- Use Zod schemas for all input validation
- Validate file uploads
- Validate JWT tokens
- Validate database operations

## Security Guidelines

### Authentication
- Never commit secrets or API keys
- Use proper JWT token validation
- Implement rate limiting for authentication
- Use HTTPS in production

### Authorization
- Implement proper role-based access control
- Validate resource ownership
- Use middleware for authorization checks
- Never trust client-side data

### Data Protection
- Validate all inputs
- Use parameterized queries
- Sanitize file uploads
- Implement proper CORS policies

### File Upload Security
- Validate file types and sizes
- Store files temporarily
- Delete files after approval
- Never expose file paths publicly

## Development Tips

### Common Issues
1. **"verbatimModuleSyntax" error** → Add `type` keyword to imports
2. **MongoDB connection fails** → Run `docker-compose up -d`
3. **Module not found** → Use `.js` extension in import paths
4. **Missing return type** → Add `Promise<void>` to async handlers
5. **Officer cannot login** → Check if admin has approved the account
6. **File upload fails** → Ensure uploads/officers/ directory exists and has write permissions
7. **Email already exists** → Remember email is unique per role, not globally

### Performance Considerations
- Use proper database indexes
- Implement caching where appropriate
- Optimize file upload handling
- Monitor database connection pooling

### Debugging
- Use Bun's built-in debugging tools
- Check server logs for errors
- Use Postman or curl for API testing
- Enable debug mode in development

## Documentation

### Keeping Documentation Updated
- Update API documentation when adding new endpoints
- Maintain code comments
- Update README with new features
- Document complex business logic

### API Documentation
- Use OpenAPI/Swagger for API documentation
- Include request/response examples
- Document authentication requirements
- Include error codes and handling

## Deployment

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

## IoT Integration

### IoT Device Management
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

## Support

### Getting Help
- Check existing documentation
- Search GitHub issues
- Ask questions in discussions
- Review code examples

### Reporting Issues
- Use GitHub issues for bug reports
- Include reproduction steps
- Provide error logs and stack traces
- Include environment details

### Feature Requests
- Use GitHub issues for feature requests
- Provide use case and requirements
- Discuss with maintainers
- Include implementation details

## Community

### Contributing
- Follow the contribution guidelines
- Make small, focused changes
- Write comprehensive tests
- Follow code style guidelines

### Code Review
- Be constructive and helpful
- Focus on code quality and security
- Provide specific feedback
- Consider edge cases

---

**Genesis Backend** - Building smarter communities through technology integration and automation.