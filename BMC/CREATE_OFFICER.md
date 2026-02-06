# Create Approved Officer - Quick Solutions

## Option 1: Direct MongoDB Command (Fastest)

Run this in your terminal with MongoDB running:

```bash
# Connect to MongoDB and create approved officer
docker exec -it genesis-mongodb-1 mongosh genesis --eval '
db.users.insertOne({
  name: "Test Officer",
  email: "officer@test.com",
  password: "$2a$10$YourHashedPasswordHere",
  phone: "9876543210",
  role: 12,
  isVerified: true,
  isActive: true,
  documentType: "Aadhar",
  createdAt: new Date(),
  updatedAt: new Date()
})
'
```

Or use this script:

```bash
cd TeamDABS_S04/Backend
node create-officer.js
```

## Option 2: Use MongoDB Compass (GUI)

1. Open MongoDB Compass
2. Connect to: `mongodb://localhost:27017`
3. Go to `genesis` database → `users` collection
4. Click "Add Data" → Insert Document:

```json
{
  "name": "Test Officer",
  "email": "officer@test.com",
  "password": "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi",
  "phone": "9876543210",
  "role": 12,
  "isVerified": true,
  "isActive": true,
  "documentType": "Aadhar",
  "createdAt": { "$date": { "$numberLong": "1704067200000" } },
  "updatedAt": { "$date": { "$numberLong": "1704067200000" } }
}
```

The password hash above is for: `password123`

## Option 3: Temporarily Disable Approval Check (Development Only)

Edit `Backend/controllers/officerController.ts`:

Find the login function and comment out the approval check:

```typescript
// Around line 50-60, find this code:
if (!officer.isVerified) {
  res.status(403).json({
    success: false,
    message: "Account pending admin approval",
  });
  return;
}

// Change to:
// Temporarily commented for testing
// if (!officer.isVerified) {
//   res.status(403).json({
//     success: false,
//     message: "Account pending admin approval",
//   });
//   return;
// }
```

Then restart backend and any officer can login without approval.

## Option 4: Check If Officer Already Exists

Maybe the officer is already created but not approved. Fix it:

```bash
# Connect to MongoDB
docker exec -it genesis-mongodb-1 mongosh genesis

# Find officer
db.users.find({ email: "officer@test.com" })

# If found but isVerified is false, update it:
db.users.updateOne(
  { email: "officer@test.com" },
  { $set: { isVerified: true } }
)

# Verify update
db.users.find({ email: "officer@test.com" }, { name: 1, email: 1, isVerified: 1 })
```

## Test Login After Creation

```bash
curl -X POST http://localhost:3000/api/officer/login \
  -H "Content-Type: application/json" \
  -d '{"email":"officer@test.com","password":"password123"}'
```

Should return success with token.

## Common Token Issues

If you're still getting "token failed" after successful login:

### 1. Check Token Storage (Browser Console)
```javascript
// Open browser console (F12) and run:
localStorage.getItem('officerToken')
// Should show a long JWT string
```

### 2. Check Token in Request
Open Network tab in DevTools, look for the dashboard API call:
- Should have header: `Authorization: Bearer <token>`

### 3. Clear Everything and Retry
```javascript
// In browser console:
localStorage.clear()
location.reload()
```

### 4. Check Backend JWT Secret
Make sure your `.env` file has:
```
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d
```

## Quick Test Flow

1. **Create officer** (using Option 1 or 2 above)
2. **Test login** with curl or Postman
3. **Open frontend** at http://localhost:5173
4. **Login** with officer@test.com / password123
5. **Dashboard** should load without "token failed" error

## Still Getting Errors?

Check these:
1. Is backend running? `curl http://localhost:3000/health`
2. Is MongoDB running? `docker ps`
3. Check backend logs for JWT errors
4. Make sure frontend API URL is correct in `src/services/api.js`

## Need to Create Multiple Officers?

Edit the `create-officer.js` script and change:
- `email` (must be unique)
- `name`
- `password` (plaintext, will be hashed)

Then run `node create-officer.js` again.