# BMC Officer Portal

A professional React-based web application for BMC (Brihanmumbai Municipal Corporation) officers to manage and verify society reports.

## Features

### Authentication
- **Officer Registration** with document upload (Aadhar, PAN, etc.)
- **Officer Login** with secure authentication
- Auto-login after registration

### Dashboard
- **Statistics Overview**: Pending reports, reviewed today, total approved/rejected
- **Quick Actions**: Direct access to pending and reviewed reports
- **Expiring Reports**: View reports expiring within 3 days
- **Performance Summary**: Track your approval/rejection metrics

### Report Management
- **Pending Reports**: View all reports awaiting verification
- **Review Reports**: 
  - View detailed report information
  - See submitted images with GPS verification
  - Review IoT sensor data
  - Approve or reject with comments
  - Set rebate amounts for approved reports
- **Reviewed Reports**: Track all reports you've processed
- **Report Details**:
  - AI Trust Score and Verification Probability
  - Society and submitter information
  - GPS location with accuracy
  - IoT sensor readings (vibration, battery, connection)
  - Image gallery with labels

### Notifications
- Real-time notifications for new submissions
- Report expiration alerts
- Mark as read functionality

## Tech Stack

- **React 18** - UI library
- **React Router 6** - Navigation
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **Recharts** - Data visualization
- **Axios** - HTTP client

## Project Structure

```
src/
├── components/
│   └── Layout.jsx          # Sidebar navigation & layout
├── pages/
│   ├── Login.jsx           # Officer login
│   ├── Register.jsx        # Officer registration
│   ├── Dashboard.jsx       # Statistics dashboard
│   ├── PendingReports.jsx  # List of pending reports
│   ├── ReportDetail.jsx    # Detailed report view with review
│   ├── ReviewedReports.jsx # History of reviewed reports
│   └── Notifications.jsx   # Notifications center
├── App.jsx                 # Main app with routing
├── index.css               # Global styles
└── main.jsx               # App entry point
```

## Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd BMC-Officer
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:3001`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` folder.

## API Integration

The app is configured to work with the BMC Officer API. Update the proxy configuration in `vite.config.js` to point to your backend server:

```javascript
server: {
  proxy: {
    '/api': {
      target: 'http://your-backend-url:3000',
      changeOrigin: true,
    }
  }
}
```

### Key API Endpoints

- `POST /api/officer/register` - Officer registration
- `POST /api/officer/login` - Officer login
- `GET /api/officer/me` - Get current officer profile
- `GET /api/bmc/pending-reviews` - Get pending reports
- `PATCH /api/bmc/review/:id` - Review (approve/reject) a report
- `GET /api/bmc/officer/dashboard` - Get dashboard statistics
- `GET /api/bmc/officer/notifications` - Get notifications

## Features in Detail

### Report Review Process

1. Navigate to **Pending Reports** from the sidebar
2. Click on any report to view details
3. Review:
   - AI Trust Score (0-100%)
   - Submitted images with GPS verification
   - IoT sensor data (vibration detection, battery level)
   - Society and submitter information
4. Click **Approve** or **Reject**
5. Add comments (mandatory for rejection)
6. Set rebate amount (for approvals)
7. Submit review

### AI Trust Score

The AI Trust Score (0-100%) indicates the confidence level of the system based on:
- Image quality and clarity
- GPS metadata verification
- IoT sensor readings
- Historical data patterns

**Score Interpretation:**
- **80-100%** (Green): High confidence, likely valid
- **50-79%** (Yellow): Medium confidence, review recommended
- **0-49%** (Red): Low confidence, careful review needed

## Design System

### Colors
- **Primary**: #2563eb (Blue)
- **Secondary**: #0891b2 (Cyan)
- **Success**: #10b981 (Green)
- **Danger**: #ef4444 (Red)
- **Warning**: #f59e0b (Amber)
- **Sidebar**: #0f172a (Dark slate)

### Typography
- Font family: System default (sans-serif)
- Heading sizes: 2xl, xl, lg
- Body text: sm, base

### Components
- **Cards**: White background, rounded corners, subtle shadow
- **Buttons**: Rounded, with hover states
- **Inputs**: Border focus ring, left icon support
- **Badges**: Rounded-full, colored by status

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For support, email support@bmc.gov.in or contact the development team.
