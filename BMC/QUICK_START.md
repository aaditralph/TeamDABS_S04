# 🚀 Quick Setup Guide

## Step 1: Insert Mock Data into MongoDB

### Option A: One-Command Setup (Recommended)

```bash
# Make sure MongoDB is running
docker ps

# If MongoDB container is not running:
docker-compose up -d

# Insert mock data
docker exec -i genesis-mongodb-1 mongosh genesis < ./mock-data/mongodb-insert.js
```

### Option B: Using MongoDB Compass

1. Open MongoDB Compass
2. Connect to: `mongodb://localhost:27017`
3. Create database: `genesis`
4. Open `genesis` database
5. For each collection (users, reports, societyaccounts):
   - Click "Create Collection"
   - Click "Add Data" → "Import JSON or CSV"
   - Import from `complete-mock-data.js`

### Option C: Manual Insert

Copy and paste the commands from `mongodb-insert.js` into MongoDB shell.

## Step 2: Start Backend

```bash
cd TeamDABS_S04/Backend
bun run dev
```

## Step 3: Start Frontend

```bash
cd TeamDABS_S04/BMC
npm run dev
```

## Step 4: Login

Open: `http://localhost:5173/login`

**Officer Login:**
- Email: `rajesh.officer@bmc.gov.in`
- Password: `password123`

## ✅ Verification Checklist

After logging in, verify:

- [ ] Dashboard shows statistics
- [ ] 3 pending reports visible
- [ ] Click on pending report shows details
- [ ] "Verification Score" displayed (not "AI Score")
- [ ] No rebate section visible
- [ ] IoT sensor data shown
- [ ] GPS location shown
- [ ] Can approve/reject reports
- [ ] Notifications page works
- [ ] Profile page shows officer info

## 🧪 Test Registration Flow

1. Logout from current session
2. Go to `/register`
3. Fill form:
   - Name: Test Officer
   - Email: new.officer@test.com
   - Phone: 9876549999
   - Password: password123
   - Document Type: Aadhar
   - Upload any PDF/image
4. Submit
5. Should see: "Registration Submitted - Pending Admin Approval"
6. Try to login → Should get "pending approval" error

## 📊 What's in the Mock Data?

### 3 Societies
- Green Valley Apartments (Andheri)
- Sunrise Residency (Bandra)
- Metro Heights (Dadar)

### 2 Officers (Pre-approved)
1. Rajesh Kumar - rajesh.officer@bmc.gov.in
2. Priya Sharma - priya.officer@bmc.gov.in

### 3 Residents
- Jane Resident (Green Valley)
- John Smith (Sunrise)
- Alice Johnson (Metro Heights)

### 6 Reports
- **Pending (3):** Awaiting review
- **Approved (2):** One manual, one auto-approved
- **Rejected (1):** Poor image quality

## 🎯 Demo Scenarios

### Scenario 1: Review High Score Report
1. Login
2. Go to Pending Reports
3. Click on "Sunrise Residency" (Score: 92%)
4. View IoT data showing vibration detected
5. Click Approve
6. Add comment: "Good condition"
7. Submit

### Scenario 2: Review Low Score Report
1. Go to Pending Reports
2. Click on "Metro Heights" (Score: 35%)
3. View details - low verification probability
4. Check IoT - no vibration detected
5. Click Reject
6. Add reason: "Composter not operational"
7. Submit

### Scenario 3: Check Notifications
1. Go to Notifications page
2. See unread notification about new report
3. Click to mark as read
4. Navigate to that report

### Scenario 4: View Dashboard Stats
1. Dashboard shows:
   - 3 pending reports
   - Today's reviewed count
   - Total approved/rejected
   - Auto-approved count
   - Expiring soon list

## 🔧 Troubleshooting

**"Cannot connect to database"**
```bash
docker-compose up -d
docker ps  # Verify MongoDB is running
```

**"Token failed" error**
```javascript
// In browser console:
localStorage.clear();
location.reload();
```

**"Cannot find dashboard"**
- Check backend is running: `curl http://localhost:3000/health`
- Check mock data inserted: `docker exec genesis-mongodb-1 mongosh genesis --eval 'db.reports.countDocuments()'`

**Registration not working**
- Make sure document is uploaded
- Check file size < 10MB
- Check backend logs for errors

## 📱 Mobile Testing

The dashboard is fully responsive. Test on mobile:
1. Open DevTools (F12)
2. Click mobile icon
3. Select iPhone/Android device
4. Refresh page
5. Test navigation menu
6. Test report review flow

## 📄 For PDF Demo

Key features to highlight:
1. ✅ Modern, clean UI design
2. ✅ Real-time verification scores
3. ✅ IoT sensor integration
4. ✅ GPS location tracking
5. ✅ Image verification system
6. ✅ Mobile responsive
7. ✅ Professional approval workflow
8. ✅ No rebate system (green tax compliance)
9. ✅ "Verification Score" (not AI)

## 🎉 Success!

If all checklist items pass, you're ready for demo!

Login URL: http://localhost:5173/login
Email: rajesh.officer@bmc.gov.in
Password: password123