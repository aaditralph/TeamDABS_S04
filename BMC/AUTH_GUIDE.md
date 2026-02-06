# BMC Officer Dashboard - Authentication Guide

## Quick Start

### 1. Start Backend & Database

```bash
# In Terminal 1 - Start MongoDB
cd TeamDABS_S04/Backend
docker-compose up -d

# In Terminal 2 - Start Backend
cd TeamDABS_S04/Backend
bun run dev
```

### 2. Start Frontend

```bash
cd TeamDABS_S04/BMC
npm install
npm run dev
```

### 3. Login Credentials

**Important:** Officer accounts need **admin approval** before they can login!

#### Option A: Use Admin to Create/Approve Officer

1. **Login as Admin:**
   - Email: `DABS`
   - Password: `123`
   - URL: `http://localhost:3000/admin/login` (use Postman/curl)

2. **Register an Officer** (if not already registered):
   ```bash
   curl -X POST http://localhost:3000/api/officer/register \
     -F "name=John Officer" \
     -F "email=officer@test.com" \
     -F "password=password123" \
     -F "phone=1234567890" \
     -F "documentType=Aadhar" \
     -F "document=@/path/to/document.pdf"
   ```

3. **Approve the Officer** (as admin):
   ```bash
   # Get the officer ID from pending list
   curl http://localhost:3000/admin/pending-officers \
     -H "Authorization: Bearer ADMIN_TOKEN"
   
   # Approve the officer
   curl -X PUT http://localhost:3000/admin/approve-officer/OFFICER_ID \
     -H "Authorization: Bearer ADMIN_TOKEN"
   ```

#### Option B: Direct Database Access

If you have MongoDB access, you can manually set `isVerified: true` on an officer account.

### 4. Common Errors

#### "Not authorized, token failed"
- **Cause:** Token is missing, expired, or invalid
- **Fix:** Login again at `/login`

#### "Account pending admin approval"
- **Cause:** Officer account not approved by admin yet
- **Fix:** Login as admin and approve the officer

#### "Invalid credentials"
- **Cause:** Wrong email/password
- **Fix:** Check credentials or register new account

#### "Cannot connect to backend"
- **Cause:** Backend not running
- **Fix:** Start backend with `bun run dev`

### 5. Testing the API

Test if backend is working:
```bash
# Health check
curl http://localhost:3000/health

# Should return: {"status":"ok"}
```

Test officer login:
```bash
curl -X POST http://localhost:3000/api/officer/login \
  -H "Content-Type: application/json" \
  -d '{"email":"officer@test.com","password":"password123"}'
```

### 6. API Endpoints Used

The frontend uses these endpoints:
- `POST /api/officer/login` - Login
- `GET /api/officer/me` - Get profile (token check)
- `GET /api/bmc/officer/dashboard` - Dashboard stats
- `GET /api/bmc/officer/pending` - Pending reports
- `GET /api/bmc/reports` - All reports
- `GET /api/verification/reports/:id` - Report details
- `PATCH /api/bmc/review/:id` - Approve/Reject
- `GET /api/bmc/officer/notifications` - Notifications

### 7. Token Storage

The JWT token is stored in:
- `localStorage.getItem('officerToken')` - The token
- `localStorage.getItem('officerUser')` - User data

To clear session:
```javascript
localStorage.removeItem('officerToken')
localStorage.removeItem('officerUser')
```

## Troubleshooting

**Dashboard shows "Session Expired":**
1. Click "Login Again"
2. Enter credentials
3. Make sure officer is approved by admin

**"Failed to fetch" error:**
- Backend is not running
- Check if port 3000 is available
- Run `bun run dev` in Backend folder

**CORS errors:**
- Backend should allow requests from `http://localhost:5173`
- Check if backend is properly configured

## Default Ports

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3000`
- MongoDB: `localhost:27017`