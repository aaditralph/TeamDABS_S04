// BMC Officer Dashboard - Complete Mock Data
// Use this data for database seeding and PDF demos

// ============================================
// 1. SOCIETY ACCOUNTS (3 societies)
// ============================================

const societies = [
  {
    _id: "society_001",
    societyName: "Green Valley Apartments",
    email: "greenvalley@society.com",
    phone: "9876543210",
    address: "123 Green Valley Road, Andheri West, Mumbai - 400053",
    walletBalance: 15000,
    totalRebatesEarned: 45000,
    lastComplianceDate: "2026-02-06T00:00:00.000Z",
    isActive: true,
    createdAt: "2025-01-15T00:00:00.000Z"
  },
  {
    _id: "society_002",
    societyName: "Sunrise Residency",
    email: "sunrise@society.com",
    phone: "9876543211",
    address: "45 Sunrise Colony, Bandra East, Mumbai - 400051",
    walletBalance: 8000,
    totalRebatesEarned: 22000,
    lastComplianceDate: "2026-02-05T00:00:00.000Z",
    isActive: true,
    createdAt: "2025-03-20T00:00:00.000Z"
  },
  {
    _id: "society_003",
    societyName: "Metro Heights",
    email: "metro@society.com",
    phone: "9876543212",
    address: "789 Metro Station Road, Dadar, Mumbai - 400014",
    walletBalance: 12000,
    totalRebatesEarned: 35000,
    lastComplianceDate: "2026-02-04T00:00:00.000Z",
    isActive: true,
    createdAt: "2025-02-10T00:00:00.000Z"
  }
];

// ============================================
// 2. USERS - Officers (1 approved, 1 pending)
// ============================================

// Note: Passwords are hashed using bcrypt with salt rounds 10
// password123 = $2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi

const officers = [
  {
    _id: "officer_001",
    name: "Rajesh Kumar",
    email: "rajesh.officer@bmc.gov.in",
    password: "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi",
    phone: "9876543210",
    role: 12, // Officer role
    isVerified: true,
    isActive: true,
    documentType: "Aadhar",
    verificationDate: "2025-06-01T00:00:00.000Z",
    createdAt: "2025-06-01T00:00:00.000Z",
    updatedAt: "2026-02-07T00:00:00.000Z"
  },
  {
    _id: "officer_002",
    name: "Priya Sharma",
    email: "priya.officer@bmc.gov.in",
    password: "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi",
    phone: "9876543211",
    role: 12,
    isVerified: true,
    isActive: true,
    documentType: "PAN",
    verificationDate: "2025-08-15T00:00:00.000Z",
    createdAt: "2025-08-10T00:00:00.000Z",
    updatedAt: "2026-02-07T00:00:00.000Z"
  },
  {
    _id: "officer_003",
    name: "Amit Patel",
    email: "amit.patel@email.com",
    password: "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi",
    phone: "9876543212",
    role: 12,
    isVerified: false, // PENDING APPROVAL
    isActive: false,
    documentType: "License",
    createdAt: "2026-02-07T00:00:00.000Z",
    updatedAt: "2026-02-07T00:00:00.000Z"
  }
];

// ============================================
// 3. USERS - Residents (6 residents)
// ============================================

const residents = [
  {
    _id: "resident_001",
    name: "Jane Resident",
    email: "jane.resident@email.com",
    password: "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi",
    phone: "9876543220",
    role: 13, // Resident role
    societyName: "Green Valley Apartments",
    flatNumber: "A-101",
    isVerified: true,
    isActive: true,
    createdAt: "2025-04-01T00:00:00.000Z"
  },
  {
    _id: "resident_002",
    name: "John Smith",
    email: "john.smith@email.com",
    password: "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi",
    phone: "9876543221",
    role: 13,
    societyName: "Sunrise Residency",
    flatNumber: "B-205",
    isVerified: true,
    isActive: true,
    createdAt: "2025-05-10T00:00:00.000Z"
  },
  {
    _id: "resident_003",
    name: "Alice Johnson",
    email: "alice.j@email.com",
    password: "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi",
    phone: "9876543222",
    role: 13,
    societyName: "Metro Heights",
    flatNumber: "C-301",
    isVerified: true,
    isActive: true,
    createdAt: "2025-06-15T00:00:00.000Z"
  },
  {
    _id: "resident_004",
    name: "Bob Williams",
    email: "bob.williams@email.com",
    password: "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi",
    phone: "9876543223",
    role: 13,
    societyName: "Green Valley Apartments",
    flatNumber: "A-102",
    isVerified: true,
    isActive: true,
    createdAt: "2025-07-20T00:00:00.000Z"
  },
  {
    _id: "resident_005",
    name: "Carol Davis",
    email: "carol.davis@email.com",
    password: "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi",
    phone: "9876543224",
    role: 13,
    societyName: "Sunrise Residency",
    flatNumber: "B-206",
    isVerified: true,
    isActive: true,
    createdAt: "2025-08-05T00:00:00.000Z"
  },
  {
    _id: "resident_006",
    name: "David Brown",
    email: "david.brown@email.com",
    password: "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi",
    phone: "9876543225",
    role: 13,
    societyName: "Metro Heights",
    flatNumber: "C-302",
    isVerified: true,
    isActive: true,
    createdAt: "2025-09-12T00:00:00.000Z"
  }
];

// ============================================
// 4. VERIFICATION REPORTS (10 reports)
// ============================================

const reports = [
  // Pending Reports (4)
  {
    _id: "report_001",
    societyAccountId: "society_001",
    submittedBy: "resident_001",
    submissionDate: "2026-02-07T10:30:00.000Z",
    submissionImages: [
      {
        url: "http://localhost:3000/uploads/verification/meter_001.jpg",
        uploadedAt: "2026-02-07T10:30:00.000Z",
        label: "meter_reading",
        gpsMetadata: {
          latitude: 19.0760,
          longitude: 72.8777,
          accuracy: 10,
          timestamp: "2026-02-07T10:25:00.000Z"
        }
      },
      {
        url: "http://localhost:3000/uploads/verification/composter_001.jpg",
        uploadedAt: "2026-02-07T10:30:00.000Z",
        label: "composter_photo"
      }
    ],
    verificationImages: [],
    gpsMetadata: {
      latitude: 19.0760,
      longitude: 72.8777,
      accuracy: 10,
      timestamp: "2026-02-07T10:30:00.000Z"
    },
    iotSensorData: {
      deviceId: "IOT-001",
      deviceType: "VIBRATION_SENSOR",
      vibrationStatus: "DETECTED",
      sensorValue: 0.75,
      batteryLevel: 85,
      isOnline: true
    },
    aiTrustScore: 78,
    verificationProbability: 82,
    verificationStatus: "PENDING",
    approvalType: "NONE",
    officerId: null,
    reviewTimestamp: null,
    officerComments: null,
    rejectionReason: null,
    expiresAt: "2026-02-14T10:30:00.000Z",
    createdAt: "2026-02-07T10:30:00.000Z",
    updatedAt: "2026-02-07T10:30:00.000Z"
  },
  {
    _id: "report_002",
    societyAccountId: "society_002",
    submittedBy: "resident_002",
    submissionDate: "2026-02-06T14:20:00.000Z",
    submissionImages: [
      {
        url: "http://localhost:3000/uploads/verification/meter_002.jpg",
        uploadedAt: "2026-02-06T14:20:00.000Z",
        label: "meter_reading",
        gpsMetadata: {
          latitude: 19.0820,
          longitude: 72.8900,
          accuracy: 8,
          timestamp: "2026-02-06T14:15:00.000Z"
        }
      }
    ],
    verificationImages: [],
    gpsMetadata: {
      latitude: 19.0820,
      longitude: 72.8900,
      accuracy: 8,
      timestamp: "2026-02-06T14:20:00.000Z"
    },
    iotSensorData: {
      deviceId: "IOT-002",
      deviceType: "VIBRATION_SENSOR",
      vibrationStatus: "DETECTED",
      sensorValue: 0.85,
      batteryLevel: 92,
      isOnline: true
    },
    aiTrustScore: 92,
    verificationProbability: 95,
    verificationStatus: "PENDING",
    approvalType: "NONE",
    officerId: null,
    reviewTimestamp: null,
    officerComments: null,
    rejectionReason: null,
    expiresAt: "2026-02-13T14:20:00.000Z",
    createdAt: "2026-02-06T14:20:00.000Z",
    updatedAt: "2026-02-06T14:20:00.000Z"
  },
  {
    _id: "report_003",
    societyAccountId: "society_003",
    submittedBy: "resident_003",
    submissionDate: "2026-02-05T09:15:00.000Z",
    submissionImages: [
      {
        url: "http://localhost:3000/uploads/verification/meter_003.jpg",
        uploadedAt: "2026-02-05T09:15:00.000Z",
        label: "meter_reading"
      },
      {
        url: "http://localhost:3000/uploads/verification/composter_003.jpg",
        uploadedAt: "2026-02-05T09:15:00.000Z",
        label: "composter_photo"
      }
    ],
    verificationImages: [],
    gpsMetadata: {
      latitude: 19.0650,
      longitude: 72.8650,
      accuracy: 12,
      timestamp: "2026-02-05T09:15:00.000Z"
    },
    iotSensorData: {
      deviceId: "IOT-003",
      deviceType: "VIBRATION_SENSOR",
      vibrationStatus: "NOT_DETECTED",
      sensorValue: 0.15,
      batteryLevel: 45,
      isOnline: true
    },
    aiTrustScore: 35,
    verificationProbability: 40,
    verificationStatus: "PENDING",
    approvalType: "NONE",
    officerId: null,
    reviewTimestamp: null,
    officerComments: null,
    rejectionReason: null,
    expiresAt: "2026-02-12T09:15:00.000Z",
    createdAt: "2026-02-05T09:15:00.000Z",
    updatedAt: "2026-02-05T09:15:00.000Z"
  },
  {
    _id: "report_004",
    societyAccountId: "society_001",
    submittedBy: "resident_004",
    submissionDate: "2026-02-04T16:45:00.000Z",
    submissionImages: [
      {
        url: "http://localhost:3000/uploads/verification/meter_004.jpg",
        uploadedAt: "2026-02-04T16:45:00.000Z",
        label: "meter_reading"
      }
    ],
    verificationImages: [],
    gpsMetadata: {
      latitude: 19.0765,
      longitude: 72.8780,
      accuracy: 15,
      timestamp: "2026-02-04T16:45:00.000Z"
    },
    iotSensorData: {
      deviceId: "IOT-004",
      deviceType: "VIBRATION_SENSOR",
      vibrationStatus: "DETECTED",
      sensorValue: 0.65,
      batteryLevel: 78,
      isOnline: true
    },
    aiTrustScore: 67,
    verificationProbability: 72,
    verificationStatus: "PENDING",
    approvalType: "NONE",
    officerId: null,
    reviewTimestamp: null,
    officerComments: null,
    rejectionReason: null,
    expiresAt: "2026-02-11T16:45:00.000Z",
    createdAt: "2026-02-04T16:45:00.000Z",
    updatedAt: "2026-02-04T16:45:00.000Z"
  },
  // Approved Reports (4)
  {
    _id: "report_005",
    societyAccountId: "society_002",
    submittedBy: "resident_005",
    submissionDate: "2026-02-03T11:30:00.000Z",
    submissionImages: [
      {
        url: "http://localhost:3000/uploads/verification/meter_005.jpg",
        uploadedAt: "2026-02-03T11:30:00.000Z",
        label: "meter_reading"
      },
      {
        url: "http://localhost:3000/uploads/verification/composter_005.jpg",
        uploadedAt: "2026-02-03T11:30:00.000Z",
        label: "composter_photo"
      }
    ],
    verificationImages: [
      {
        url: "http://localhost:3000/uploads/verification/officer_verify_005.jpg",
        uploadedAt: "2026-02-03T14:00:00.000Z"
      }
    ],
    gpsMetadata: {
      latitude: 19.0825,
      longitude: 72.8905,
      accuracy: 10,
      timestamp: "2026-02-03T11:30:00.000Z"
    },
    iotSensorData: {
      deviceId: "IOT-002",
      deviceType: "VIBRATION_SENSOR",
      vibrationStatus: "DETECTED",
      sensorValue: 0.88,
      batteryLevel: 91,
      isOnline: true
    },
    aiTrustScore: 88,
    verificationProbability: 91,
    verificationStatus: "OFFICER_APPROVED",
    approvalType: "OFFICER",
    officerId: "officer_001",
    reviewTimestamp: "2026-02-03T14:00:00.000Z",
    officerComments: "All documents verified. Composter in good condition.",
    rejectionReason: null,
    expiresAt: "2026-02-10T11:30:00.000Z",
    createdAt: "2026-02-03T11:30:00.000Z",
    updatedAt: "2026-02-03T14:00:00.000Z"
  },
  {
    _id: "report_006",
    societyAccountId: "society_003",
    submittedBy: "resident_006",
    submissionDate: "2026-02-02T13:00:00.000Z",
    submissionImages: [
      {
        url: "http://localhost:3000/uploads/verification/meter_006.jpg",
        uploadedAt: "2026-02-02T13:00:00.000Z",
        label: "meter_reading"
      }
    ],
    verificationImages: [],
    gpsMetadata: {
      latitude: 19.0655,
      longitude: 72.8655,
      accuracy: 9,
      timestamp: "2026-02-02T13:00:00.000Z"
    },
    iotSensorData: {
      deviceId: "IOT-003",
      deviceType: "VIBRATION_SENSOR",
      vibrationStatus: "DETECTED",
      sensorValue: 0.72,
      batteryLevel: 82,
      isOnline: true
    },
    aiTrustScore: 85,
    verificationProbability: 88,
    verificationStatus: "OFFICER_APPROVED",
    approvalType: "OFFICER",
    officerId: "officer_001",
    reviewTimestamp: "2026-02-02T15:30:00.000Z",
    officerComments: "Verification complete. Meter readings accurate.",
    rejectionReason: null,
    expiresAt: "2026-02-09T13:00:00.000Z",
    createdAt: "2026-02-02T13:00:00.000Z",
    updatedAt: "2026-02-02T15:30:00.000Z"
  },
  {
    _id: "report_007",
    societyAccountId: "society_001",
    submittedBy: "resident_001",
    submissionDate: "2026-02-01T09:00:00.000Z",
    submissionImages: [
      {
        url: "http://localhost:3000/uploads/verification/meter_007.jpg",
        uploadedAt: "2026-02-01T09:00:00.000Z",
        label: "meter_reading"
      },
      {
        url: "http://localhost:3000/uploads/verification/composter_007.jpg",
        uploadedAt: "2026-02-01T09:00:00.000Z",
        label: "composter_photo"
      }
    ],
    verificationImages: [],
    gpsMetadata: {
      latitude: 19.0760,
      longitude: 72.8777,
      accuracy: 8,
      timestamp: "2026-02-01T09:00:00.000Z"
    },
    iotSensorData: {
      deviceId: "IOT-001",
      deviceType: "VIBRATION_SENSOR",
      vibrationStatus: "DETECTED",
      sensorValue: 0.80,
      batteryLevel: 88,
      isOnline: true
    },
    aiTrustScore: 95,
    verificationProbability: 97,
    verificationStatus: "AUTO_APPROVED",
    approvalType: "AUTOMATIC",
    officerId: null,
    reviewTimestamp: "2026-02-01T09:01:00.000Z",
    officerComments: null,
    rejectionReason: null,
    expiresAt: "2026-02-08T09:00:00.000Z",
    createdAt: "2026-02-01T09:00:00.000Z",
    updatedAt: "2026-02-01T09:01:00.000Z"
  },
  {
    _id: "report_008",
    societyAccountId: "society_002",
    submittedBy: "resident_002",
    submissionDate: "2026-01-31T10:30:00.000Z",
    submissionImages: [
      {
        url: "http://localhost:3000/uploads/verification/meter_008.jpg",
        uploadedAt: "2026-01-31T10:30:00.000Z",
        label: "meter_reading"
      }
    ],
    verificationImages: [],
    gpsMetadata: {
      latitude: 19.0820,
      longitude: 72.8900,
      accuracy: 11,
      timestamp: "2026-01-31T10:30:00.000Z"
    },
    iotSensorData: {
      deviceId: "IOT-002",
      deviceType: "VIBRATION_SENSOR",
      vibrationStatus: "DETECTED",
      sensorValue: 0.78,
      batteryLevel: 79,
      isOnline: true
    },
    aiTrustScore: 82,
    verificationProbability: 86,
    verificationStatus: "OFFICER_APPROVED",
    approvalType: "OFFICER",
    officerId: "officer_002",
    reviewTimestamp: "2026-01-31T13:00:00.000Z",
    officerComments: "Good submission. All requirements met.",
    rejectionReason: null,
    expiresAt: "2026-02-07T10:30:00.000Z",
    createdAt: "2026-01-31T10:30:00.000Z",
    updatedAt: "2026-01-31T13:00:00.000Z"
  },
  // Rejected Reports (2)
  {
    _id: "report_009",
    societyAccountId: "society_003",
    submittedBy: "resident_003",
    submissionDate: "2026-01-30T11:00:00.000Z",
    submissionImages: [
      {
        url: "http://localhost:3000/uploads/verification/meter_009.jpg",
        uploadedAt: "2026-01-30T11:00:00.000Z",
        label: "meter_reading"
      }
    ],
    verificationImages: [],
    gpsMetadata: {
      latitude: 19.0650,
      longitude: 72.8650,
      accuracy: 25,
      timestamp: "2026-01-30T11:00:00.000Z"
    },
    iotSensorData: {
      deviceId: "IOT-003",
      deviceType: "VIBRATION_SENSOR",
      vibrationStatus: "NOT_DETECTED",
      sensorValue: 0.10,
      batteryLevel: 30,
      isOnline: false
    },
    aiTrustScore: 25,
    verificationProbability: 30,
    verificationStatus: "REJECTED",
    approvalType: "OFFICER",
    officerId: "officer_001",
    reviewTimestamp: "2026-01-30T14:00:00.000Z",
    officerComments: null,
    rejectionReason: "Meter reading unclear. Image quality too poor. Please resubmit with clearer photo.",
    expiresAt: "2026-02-06T11:00:00.000Z",
    createdAt: "2026-01-30T11:00:00.000Z",
    updatedAt: "2026-01-30T14:00:00.000Z"
  },
  {
    _id: "report_010",
    societyAccountId: "society_001",
    submittedBy: "resident_004",
    submissionDate: "2026-01-29T08:30:00.000Z",
    submissionImages: [
      {
        url: "http://localhost:3000/uploads/verification/composter_010.jpg",
        uploadedAt: "2026-01-29T08:30:00.000Z",
        label: "composter_photo"
      }
    ],
    verificationImages: [],
    gpsMetadata: {
      latitude: 19.0770,
      longitude: 72.8790,
      accuracy: 50,
      timestamp: "2026-01-29T08:30:00.000Z"
    },
    iotSensorData: {
      deviceId: "IOT-004",
      deviceType: "VIBRATION_SENSOR",
      vibrationStatus: "NOT_DETECTED",
      sensorValue: 0.05,
      batteryLevel: 15,
      isOnline: false
    },
    aiTrustScore: 15,
    verificationProbability: 20,
    verificationStatus: "REJECTED",
    approvalType: "OFFICER",
    officerId: "officer_002",
    reviewTimestamp: "2026-01-29T12:00:00.000Z",
    officerComments: null,
    rejectionReason: "GPS coordinates don't match society location. Possible fraudulent submission.",
    expiresAt: "2026-02-05T08:30:00.000Z",
    createdAt: "2026-01-29T08:30:00.000Z",
    updatedAt: "2026-01-29T12:00:00.000Z"
  }
];

// ============================================
// 5. NOTIFICATIONS (5 notifications)
// ============================================

const notifications = [
  {
    _id: "notif_001",
    officerId: "officer_001",
    type: "REPORT_SUBMITTED",
    title: "New Report Submitted",
    message: "Green Valley Apartments has submitted a new report for verification.",
    reportId: "report_001",
    societyId: "society_001",
    isRead: false,
    createdAt: "2026-02-07T10:30:00.000Z"
  },
  {
    _id: "notif_002",
    officerId: "officer_001",
    type: "REPORT_SUBMITTED",
    title: "New Report Submitted",
    message: "Sunrise Residency has submitted a new report for verification.",
    reportId: "report_002",
    societyId: "society_002",
    isRead: false,
    createdAt: "2026-02-06T14:20:00.000Z"
  },
  {
    _id: "notif_003",
    officerId: "officer_001",
    type: "REPORT_EXPIRING",
    title: "Report Expiring Soon",
    message: "Report from Metro Heights will expire in 2 days if not reviewed.",
    reportId: "report_003",
    societyId: "society_003",
    isRead: true,
    createdAt: "2026-02-05T09:15:00.000Z"
  },
  {
    _id: "notif_004",
    officerId: "officer_001",
    type: "REPORT_APPROVED",
    title: "Report Approved",
    message: "You approved a report from Sunrise Residency.",
    reportId: "report_005",
    societyId: "society_002",
    isRead: true,
    createdAt: "2026-02-03T14:00:00.000Z"
  },
  {
    _id: "notif_005",
    officerId: "officer_001",
    type: "REPORT_REJECTED",
    title: "Report Rejected",
    message: "You rejected a report from Metro Heights due to poor image quality.",
    reportId: "report_009",
    societyId: "society_003",
    isRead: true,
    createdAt: "2026-01-30T14:00:00.000Z"
  }
];

// ============================================
// 6. DASHBOARD STATS (Calculated from above data)
// ============================================

const dashboardStats = {
  pendingReports: 4, // report_001, 002, 003, 004
  reviewedToday: 2, // Would calculate based on current date
  totalApproved: 4, // report_005, 006, 007, 008
  totalRejected: 2, // report_009, 010
  autoApproved: 1, // report_007
  autoApprovalThreshold: 50,
  recentExpiringReports: [
    {
      _id: "report_003",
      societyAccountId: {
        _id: "society_003",
        societyName: "Metro Heights"
      },
      expiresAt: "2026-02-12T09:15:00.000Z"
    },
    {
      _id: "report_004",
      societyAccountId: {
        _id: "society_001",
        societyName: "Green Valley Apartments"
      },
      expiresAt: "2026-02-11T16:45:00.000Z"
    }
  ]
};

// ============================================
// MONGODB INSERT COMMANDS
// ============================================

console.log(`
// ============================================
// MONGODB SEED COMMANDS
// Paste these in MongoDB shell or Compass
// ============================================

// 1. Insert Societies
db.societyaccounts.insertMany(${JSON.stringify(societies, null, 2)});

// 2. Insert Officers & Residents (Users)
db.users.insertMany([
  ...${JSON.stringify(officers, null, 2)},
  ...${JSON.stringify(residents, null, 2)}
]);

// 3. Insert Reports
db.reports.insertMany(${JSON.stringify(reports, null, 2)});

// 4. Insert Notifications
db.notifications.insertMany(${JSON.stringify(notifications, null, 2)});

console.log('✅ Mock data inserted successfully!');
console.log('Login with: rajesh.officer@bmc.gov.in / password123');
`);

// Export for use in other files
module.exports = {
  societies,
  officers,
  residents,
  reports,
  notifications,
  dashboardStats
};