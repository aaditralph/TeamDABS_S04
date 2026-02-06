# Quick Setup - Create Test Officer Account

## Step 1: Start Everything

```bash
# Terminal 1: Start MongoDB
cd TeamDABS_S04/Backend
docker-compose up -d

# Terminal 2: Start Backend
cd TeamDABS_S04/Backend
bun run dev

# Terminal 3: Start Frontend
cd TeamDABS_S04/BMC
npm run dev
```

## Step 2: Create & Approve Officer (One Command)

Copy and paste this entire block into your terminal:

```bash
# 1. Login as Admin and get token
echo "Step 1: Logging in as Admin..."
ADMIN_TOKEN=$(curl -s -X POST http://localhost:3000/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"DABS","password":"123"}' | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

echo "Admin Token: $ADMIN_TOKEN"

# 2. Register Officer (if not exists)
echo ""
echo "Step 2: Registering Officer..."
curl -s -X POST http://localhost:3000/api/officer/register \
  -H "Content-Type: multipart/form-data" \
  -F "name=Test Officer" \
  -F "email=officer@test.com" \
  -F "password=password123" \
  -F "phone=9876543210" \
  -F "documentType=Aadhar"

echo ""
echo "Step 3: Getting Pending Officers List..."
# 3. Get pending officers
PENDING=$(curl -s http://localhost:3000/admin/pending-officers \
  -H "Authorization: Bearer $ADMIN_TOKEN")

echo "Pending Officers: $PENDING"

# Extract officer ID (this is a simple extraction, might need adjustment)
OFFICER_ID=$(echo $PENDING | grep -o '"_id":"[^"]*"' | head -1 | cut -d'"' -f4)

echo ""
echo "Step 4: Approving Officer (ID: $OFFICER_ID)..."
# 4. Approve officer
if [ ! -z "$OFFICER_ID" ]; then
  curl -s -X PUT "http://localhost:3000/admin/approve-officer/$OFFICER_ID" \
    -H "Authorization: Bearer $ADMIN_TOKEN"
  echo ""
  echo "✅ Officer approved successfully!"
else
  echo "⚠️  Officer ID not found. Officer might already be approved or registration failed."
fi

echo ""
echo "=== LOGIN CREDENTIALS ==="
echo "Email: officer@test.com"
echo "Password: password123"
echo "========================"
```

## Step 3: Login to Frontend

Open `http://localhost:5173/login` and use:
- **Email:** `officer@test.com`
- **Password:** `password123`

## Alternative: Manual Steps

If the script doesn't work, do it manually:

### 1. Login as Admin
```bash
curl -X POST http://localhost:3000/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"DABS","password":"123"}'
```
Copy the token from the response.

### 2. Register Officer
```bash
curl -X POST http://localhost:3000/api/officer/register \
  -F "name=Test Officer" \
  -F "email=officer@test.com" \
  -F "password=password123" \
  -F "phone=9876543210" \
  -F "documentType=Aadhar"
```

### 3. Get Pending Officers
```bash
curl http://localhost:3000/admin/pending-officers \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```
Copy the `_id` field.

### 4. Approve Officer
```bash
curl -X PUT http://localhost:3000/admin/approve-officer/OFFICER_ID \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### 5. Test Officer Login
```bash
curl -X POST http://localhost:3000/api/officer/login \
  -H "Content-Type: application/json" \
  -d '{"email":"officer@test.com","password":"password123"}'
```

## Expected Response

Success:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "...",
      "name": "Test Officer",
      "email": "officer@test.com",
      "role": 12,
      "isVerified": true
    }
  }
}
```

## Troubleshooting

**"Cannot connect" errors:**
- Make sure backend is running on port 3000
- Make sure MongoDB is running: `docker-compose up -d`

**"Officer already exists":**
- Try logging in with existing credentials
- Or use a different email: `officer2@test.com`

**"Admin token invalid":**
- Check that you're using the correct token
- Token expires after some time, login again

**Dashboard still shows errors:**
1. Clear browser localStorage:
   ```javascript
   localStorage.clear()
   ```
2. Refresh page
3. Login again