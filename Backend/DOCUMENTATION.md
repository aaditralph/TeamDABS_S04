Documentation.md  
 Backend System Documentation
 1. Overview
We've implemented a modernized backend architecture with the following key components:
- Centralized society account management
- Enhanced report tracking with IoT integration
- Role-based access control
- Automated workflows for report validation
 2. Core Components
 2.1 Models
**New Models Created:**
- `models/SocietyAccount.ts`: Unified society account system (replaces BwgSociety/SocietyProfile)
  - Fields: societyName, email, phone, address, walletBalance, complianceStreak, verificationStatus
  - Relationships: linked to User accounts
- `models/Report.ts`: Enhanced report tracking system
  - Fields: 
    - submissionImages (array of image URLs with GPS metadata)
    - verificationImages (array of verification images)
    - iotSensorData (device readings)
    - verificationProbability (AI score)
    - verificationStatus (PENDING/AUTO_APPROVED/OFFICER_APPROVED/REJECTED/EXPIRED)
    - approvalType (OFFICER/AUTOMATIC/NONE)
    - expiry tracking
**Updated Models:**
- `models/User.ts`: Now references SocietyAccount instead of BwgSociety
- `models/IoTDevice.ts`: Now references SocietyAccount instead of User
**Deleted Models:**
- `models/BwgSociety.ts`
- `models/SocietyProfile.ts`
- `scripts/migrateSociety.ts`
 2.2 Controllers
**New Controllers:**
- `controllers/societyController.ts`: Society registration/login with account linking
- `controllers/bmcController.ts`: Report management (pending reviews, history, expiration)
- `controllers/verificationController.ts`: Report submission and verification workflow
**Updated Controllers:**
- `controllers/adminController.ts`: Society approval workflow
- `controllers/verificationController.ts`: Validation schemas for reports
 2.3 Routes
**New Routes:**
- `/api/society/register`: Society account creation
- `/api/society/login`: Society account login
- `/api/society/me`: Current user society info
- `/api/society/society`: Society account details
- `/api/bmc/reports`: Report management
- `/api/verification/reports`: Report submission and review
 2.4 Validation Schemas
- `utils/validation.ts`: 
  - `reportSubmissionSchema`: Validates report submissions
  - `officerReviewSchema`: Validates officer reviews
  - Type definitions for all input types
 3. Architecture Diagram
Frontend -> Auth Middleware -> Controllers -> Database
         |                        |              |
         |                        |              |
       /!\ Role Checks           /!\ Models      /!\ Repos
         |                        |              |
         v                        v              v
User Routes   Society Routes   Report Routes   Database
## 4. Key Features
- Single society account per organization
- Dual image verification system
- IoT device integration for vibration data
- Automated report expiration (7 days)
- Role-based access control (admin, officer, society, resident)
- Comprehensive validation schemas
## 5. Next Steps
### 5.1 Immediate Tasks
1. **Database Setup**: Create MongoDB collections for SocietyAccount and Report
2. **Verification Engine**: Implement AI trust score calculation
3. **Frontend Integration**: Connect to new API endpoints
4. **Testing**: 
   - Unit tests for controllers
   - End-to-end tests for report workflow
5. **Documentation**: Complete API reference documentation
### 5.2 Long-Term Improvements
- Add webhook notifications for report status changes
- Implement analytics dashboard for compliance tracking
- Add multi-factor authentication for admin access
- Create audit log for all report modifications
## 6. File Locations
- Models: `models/`
- Controllers: `controllers/`
- Routes: `routes/`
- Validation: `utils/validation.ts`
- Migrations: (Removed legacy migration scripts)
## 7. Dependencies
- MongoDB for data storage
- Zod for schema validation
- Express.js for API routing
- JWT for authentication
- Socket.io for real-time notifications (optional)
## 8. Security Considerations
- All routes require authentication
- Role-based access controls
- Input validation for all API endpoints
- Secure JWT token storage
- Regular security audits
## 9. Contributing
To continue development:
1. Set up MongoDB database
2. Run `bun x tsc` to compile TypeScript
3. Start server with `bun x dev`
4. Use Postman or frontend to test endpoints
5. Add tests in `test/` directory
