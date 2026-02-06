# 🌱 EcoScore - Resident Portal

A gamified, interactive web application for Mumbai residents to track society green savings, view leaderboards, and calculate tax rebates.

## ✨ Features

### 🏠 Society Search
- **Find Your Building**: Search societies by name
- **View Society Details**: Address, contact info, compliance streak
- **Track Reports**: View submission history and verification status
- **Monitor Savings**: See total rebates earned

### 🏆 Gamified Leaderboard
- **Real-time Rankings**: Societies ranked by verification score & streak
- **Visual Podium**: Top 3 societies with animated podium
- **Tier System**: Champion, Diamond, Gold, Silver, Bronze badges
- **Scoring Formula**: 
  - 50% Verification Score
  - 30% Consistency Score  
  - 20% Daily Streak Bonus

### 💰 Savings Calculator
- **Interactive Calculator**: Adjust property tax and compliance days
- **Instant Results**: See potential rebates in real-time
- **Multi-year Projection**: 5-year savings estimate
- **Formula Display**: Transparent rebate calculation

### 📊 Dashboard
- **Modern UI**: Gradient designs, animations, glass effects
- **Mobile Responsive**: Works perfectly on all devices
- **Fast Performance**: Optimized React with Vite

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Backend API running on `http://localhost:3000`
- MongoDB with mock data

### Installation

```bash
cd TeamDABS_S04/Resident-Portal
npm install
npm run dev
```

Open: `http://localhost:5174`

## 📁 Project Structure

```
Resident-Portal/
├── src/
│   ├── components/
│   │   └── Layout.jsx          # Navigation & layout
│   ├── pages/
│   │   ├── Home.jsx            # Landing page with stats
│   │   ├── SearchSociety.jsx   # Society search functionality
│   │   ├── SocietyDetails.jsx  # Individual society view
│   │   ├── Leaderboard.jsx     # Gamified rankings
│   │   └── SavingsDashboard.jsx # Calculator & benefits
│   ├── services/
│   │   └── api.js              # API integration
│   ├── App.jsx                 # Routes
│   └── main.jsx               # Entry point
├── public/
├── package.json
├── tailwind.config.js
└── vite.config.js
```

## 🔌 API Integration

### Endpoints Used

```javascript
// Society APIs
GET /api/resident/societies                    // List all societies
GET /api/resident/societies/:name              // Get society details
GET /api/resident/societies/:name/reports      // Get society reports
GET /api/resident/societies/:name/tax-rebates  // Get tax rebates

// Leaderboard APIs
GET /api/resident/leaderboard                  // Full leaderboard
GET /api/resident/leaderboard/top/:n           // Top N societies
GET /api/resident/leaderboard/society/:name    // Society rank
```

## 🎨 Design Features

### Visual Elements
- **Gradient Backgrounds**: Primary to secondary color transitions
- **Glass Morphism**: Semi-transparent cards with blur effects
- **Animations**: Framer Motion for smooth transitions
- **Responsive Grid**: Mobile-first design approach
- **Color Palette**:
  - Primary: Emerald green (#10b981)
  - Secondary: Blue (#3b82f6)
  - Accents: Gold, Silver, Bronze for tiers

### Gamification Elements
- **Podium Display**: Animated top 3 with trophies
- **Badge System**: Tier-based achievement badges
- **Progress Indicators**: Streak counters, score bars
- **Ranking Numbers**: Gradient backgrounds for top ranks

## 📊 Scoring Formula

```
Overall Score = (Verification Score × 0.5) + 
                (Consistency Score × 0.3) + 
                (Compliance Streak × 2 × 0.2)
```

### Breakdown
1. **Verification Score (50%)**: Average of all verification probabilities
2. **Consistency Score (30%)**: Percentage of approved reports
3. **Streak Bonus (20%)**: Daily submission streak × 2 (capped at 40 points)

## 💡 Rebate Calculation

```
Rebate = Property Tax × 5% × (Compliance Days / 365)
```

**Example:**
- Property Tax: ₹500,000
- Compliance: 30 days
- Rebate: ₹500,000 × 0.05 × (30/365) = ₹2,055

## 🏅 Tier System

| Score | Tier | Icon | Color |
|-------|------|------|-------|
| 1st | Champion | 👑 | Gold gradient |
| 2nd | Runner Up | 🥈 | Silver gradient |
| 3rd | Bronze | 🥉 | Bronze gradient |
| 80-100 | Diamond | 💎 | Blue |
| 60-79 | Gold | 🥇 | Gold |
| 40-59 | Silver | 🥈 | Silver |
| 0-39 | Bronze | 🥉 | Bronze |

## 📱 Pages

### 1. Home (`/`)
- Hero section with call-to-action
- Platform statistics (societies, rebates, residents)
- Top 5 societies preview
- How it works section

### 2. Search (`/search`)
- Real-time society search
- Results with society cards
- Quick stats (rebates, streak)

### 3. Society Details (`/society/:name`)
- Society header with gradient
- Stats cards (rebates, reports, score)
- Recent activity tab
- All reports tab

### 4. Leaderboard (`/leaderboard`)
- Top 3 podium with animations
- Scoring explanation
- Full rankings list
- Tips to improve score

### 5. Savings Calculator (`/savings`)
- Interactive sliders
- Real-time calculations
- Benefits explanation
- How it works steps

## 🔧 Backend Changes Made

### New Files Created
1. **`Backend/controllers/gamificationController.ts`**
   - `getAllSocieties()` - List all verified societies
   - `getSocietyByName()` - Get single society
   - `getSocietyReports()` - Get reports with filters
   - `getLeaderboard()` - Calculate and return rankings
   - `getTopSocieties()` - Top N performers
   - `getSocietyRank()` - Individual rank with neighbors
   - `calculateSocietyScore()` - Scoring logic

2. **`Backend/routes/gamification.ts`**
   - All public routes (no auth required)
   - RESTful API design

3. **`Backend/src/app.ts`** (Modified)
   - Added gamification routes
   - Mounted at `/api/resident`

### Scoring Logic
```typescript
const calculateSocietyScore = (society, reports) => {
  const consistencyScore = (approvedReports / totalReports) * 100;
  const avgVerificationScore = reports.reduce((sum, r) => 
    sum + r.verificationProbability, 0) / totalReports;
  const complianceBonus = Math.min(complianceStreak * 2, 40);
  
  return (avgVerificationScore * 0.5) + 
         (consistencyScore * 0.3) + 
         (complianceBonus * 0.2);
};
```

## 🎯 Mock Data for Testing

Use the mock data from `BMC/mock-data/`:
- Insert into MongoDB
- Includes societies, officers, residents, reports
- Login with: `rajesh.officer@bmc.gov.in` / `password123`

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Serve Static Files
```bash
npm run preview
```

## 📝 Notes

- **No Authentication**: All resident routes are public
- **CORS**: Backend must allow `http://localhost:5174`
- **Images**: Placeholder URLs used, replace with actual uploads
- **Mobile**: Fully responsive, tested on all screen sizes

## 🤝 Integration with BMC Officer Dashboard

- Shares same backend API
- Uses same database collections
- Different frontend (resident-focused vs officer-focused)
- Public access vs authenticated access

## 📄 License

Part of Team DABS Project - BMC Waste Management System

---

**Created with ❤️ for a greener Mumbai!** 🌱