// MongoDB Insert Script for BMC Officer Dashboard Mock Data
// Run this in MongoDB shell or MongoDB Compass

use genesis;

// ============================================
// 1. INSERT SOCIETIES
// ============================================
db.societyaccounts.insertMany([
  {
    _id: ObjectId("65c123456789012345678901"),
    societyName: "Green Valley Apartments",
    email: "greenvalley@society.com",
    phone: "9876543210",
    address: "123 Green Valley Road, Andheri West, Mumbai - 400053",
    walletBalance: 15000,
    totalRebatesEarned: 45000,
    lastComplianceDate: ISODate("2026-02-06T00:00:00.000Z"),
    isActive: true,
    createdAt: ISODate("2025-01-15T00:00:00.000Z")
  },
  {
    _id: ObjectId("65c123456789012345678902"),
    societyName: "Sunrise Residency",
    email: "sunrise@society.com",
    phone: "9876543211",
    address: "45 Sunrise Colony, Bandra East, Mumbai - 400051",
    walletBalance: 8000,
    totalRebatesEarned: 22000,
    lastComplianceDate: ISODate("2026-02-05T00:00:00.000Z"),
    isActive: true,
    createdAt: ISODate("2025-03-20T00:00:00.000Z")
  },
  {
    _id: ObjectId("65c123456789012345678903"),
    societyName: "Metro Heights",
    email: "metro@society.com",
    phone: "9876543212",
    address: "789 Metro Station Road, Dadar, Mumbai - 400014",
    walletBalance: 12000,
    totalRebatesEarned: 35000,
    lastComplianceDate: ISODate("2026-02-04T00:00:00.000Z"),
    isActive: true,
    createdAt: ISODate("2025-02-10T00:00:00.000Z")
  }
]);

// ============================================
// 2. INSERT OFFICERS
// ============================================
db.users.insertMany([
  {
    _id: ObjectId("65c123456789012345678911"),
    name: "Rajesh Kumar",
    email: "rajesh.officer@bmc.gov.in",
    password: "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi",
    phone: "9876543210",
    role: 12,
    isVerified: true,
    isActive: true,
    documentType: "Aadhar",
    verificationDate: ISODate("2025-06-01T00:00:00.000Z"),
    createdAt: ISODate("2025-06-01T00:00:00.000Z"),
    updatedAt: ISODate("2026-02-07T00:00:00.000Z")
  },
  {
    _id: ObjectId("65c123456789012345678912"),
    name: "Priya Sharma",
    email: "priya.officer@bmc.gov.in",
    password: "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi",
    phone: "9876543211",
    role: 12,
    isVerified: true,
    isActive: true,
    documentType: "PAN",
    verificationDate: ISODate("2025-08-15T00:00:00.000Z"),
    createdAt: ISODate("2025-08-10T00:00:00.000Z"),
    updatedAt: ISODate("2026-02-07T00:00:00.000Z")
  }
]);

// ============================================
// 3. INSERT RESIDENTS
// ============================================
db.users.insertMany([
  {
    _id: ObjectId("65c123456789012345678921"),
    name: "Jane Resident",
    email: "jane.resident@email.com",
    password: "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi",
    phone: "9876543220",
    role: 13,
    societyName: "Green Valley Apartments",
    flatNumber: "A-101",
    isVerified: true,
    isActive: true,
    createdAt: ISODate("2025-04-01T00:00:00.000Z")
  },
  {
    _id: ObjectId("65c123456789012345678922"),
    name: "John Smith",
    email: "john.smith@email.com",
    password: "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi",
    phone: "9876543221",
    role: 13,
    societyName: "Sunrise Residency",
    flatNumber: "B-205",
    isVerified: true,
    isActive: true,
    createdAt: ISODate("2025-05-10T00:00:00.000Z")
  },
  {
    _id: ObjectId("65c123456789012345678923"),
    name: "Alice Johnson",
    email: "alice.j@email.com",
    password: "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi",
    phone: "9876543222",
    role: 13,
    societyName: "Metro Heights",
    flatNumber: "C-301",
    isVerified: true,
    isActive: true,
    createdAt: ISODate("2025-06-15T00:00:00.000Z")
  }
]);

// ============================================
// 4. INSERT REPORTS
// ============================================
db.reports.insertMany([
  // PENDING REPORTS
  {
    _id: ObjectId("65c123456789012345678931"),
    societyAccountId: ObjectId("65c123456789012345678901"),
    submittedBy: ObjectId("65c123456789012345678921"),
    submissionDate: ISODate("2026-02-07T10:30:00.000Z"),
    submissionImages: [
      {
        url: "http://localhost:3000/uploads/verification/meter_001.jpg",
        uploadedAt: ISODate("2026-02-07T10:30:00.000Z"),
        label: "meter_reading",
        gpsMetadata: {
          latitude: 19.0760,
          longitude: 72.8777,
          accuracy: 10,
          timestamp: ISODate("2026-02-07T10:25:00.000Z")
        }
      },
      {
        url: "http://localhost:3000/uploads/verification/composter_001.jpg",
        uploadedAt: ISODate("2026-02-07T10:30:00.000Z"),
        label: "composter_photo"
      }
    ],
    verificationImages: [],
    gpsMetadata: {
      latitude: 19.0760,
      longitude: 72.8777,
      accuracy: 10,
      timestamp: ISODate("2026-02-07T10:30:00.000Z")
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
    expiresAt: ISODate("2026-02-14T10:30:00.000Z"),
    createdAt: ISODate("2026-02-07T10:30:00.000Z"),
    updatedAt: ISODate("2026-02-07T10:30:00.000Z")
  },
  {
    _id: ObjectId("65c123456789012345678932"),
    societyAccountId: ObjectId("65c123456789012345678902"),
    submittedBy: ObjectId("65c123456789012345678922"),
    submissionDate: ISODate("2026-02-06T14:20:00.000Z"),
    submissionImages: [
      {
        url: "http://localhost:3000/uploads/verification/meter_002.jpg",
        uploadedAt: ISODate("2026-02-06T14:20:00.000Z"),
        label: "meter_reading",
        gpsMetadata: {
          latitude: 19.0820,
          longitude: 72.8900,
          accuracy: 8,
          timestamp: ISODate("2026-02-06T14:15:00.000Z")
        }
      }
    ],
    verificationImages: [],
    gpsMetadata: {
      latitude: 19.0820,
      longitude: 72.8900,
      accuracy: 8,
      timestamp: ISODate("2026-02-06T14:20:00.000Z")
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
    expiresAt: ISODate("2026-02-13T14:20:00.000Z"),
    createdAt: ISODate("2026-02-06T14:20:00.000Z"),
    updatedAt: ISODate("2026-02-06T14:20:00.000Z")
  },
  {
    _id: ObjectId("65c123456789012345678933"),
    societyAccountId: ObjectId("65c123456789012345678903"),
    submittedBy: ObjectId("65c123456789012345678923"),
    submissionDate: ISODate("2026-02-05T09:15:00.000Z"),
    submissionImages: [
      {
        url: "http://localhost:3000/uploads/verification/meter_003.jpg",
        uploadedAt: ISODate("2026-02-05T09:15:00.000Z"),
        label: "meter_reading"
      },
      {
        url: "http://localhost:3000/uploads/verification/composter_003.jpg",
        uploadedAt: ISODate("2026-02-05T09:15:00.000Z"),
        label: "composter_photo"
      }
    ],
    verificationImages: [],
    gpsMetadata: {
      latitude: 19.0650,
      longitude: 72.8650,
      accuracy: 12,
      timestamp: ISODate("2026-02-05T09:15:00.000Z")
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
    expiresAt: ISODate("2026-02-12T09:15:00.000Z"),
    createdAt: ISODate("2026-02-05T09:15:00.000Z"),
    updatedAt: ISODate("2026-02-05T09:15:00.000Z")
  },
  // APPROVED REPORTS
  {
    _id: ObjectId("65c123456789012345678934"),
    societyAccountId: ObjectId("65c123456789012345678902"),
    submittedBy: ObjectId("65c123456789012345678922"),
    submissionDate: ISODate("2026-02-03T11:30:00.000Z"),
    submissionImages: [
      {
        url: "http://localhost:3000/uploads/verification/meter_005.jpg",
        uploadedAt: ISODate("2026-02-03T11:30:00.000Z"),
        label: "meter_reading"
      },
      {
        url: "http://localhost:3000/uploads/verification/composter_005.jpg",
        uploadedAt: ISODate("2026-02-03T11:30:00.000Z"),
        label: "composter_photo"
      }
    ],
    verificationImages: [
      {
        url: "http://localhost:3000/uploads/verification/officer_verify_005.jpg",
        uploadedAt: ISODate("2026-02-03T14:00:00.000Z")
      }
    ],
    gpsMetadata: {
      latitude: 19.0825,
      longitude: 72.8905,
      accuracy: 10,
      timestamp: ISODate("2026-02-03T11:30:00.000Z")
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
    officerId: ObjectId("65c123456789012345678911"),
    reviewTimestamp: ISODate("2026-02-03T14:00:00.000Z"),
    officerComments: "All documents verified. Composter in good condition.",
    rejectionReason: null,
    expiresAt: ISODate("2026-02-10T11:30:00.000Z"),
    createdAt: ISODate("2026-02-03T11:30:00.000Z"),
    updatedAt: ISODate("2026-02-03T14:00:00.000Z")
  },
  {
    _id: ObjectId("65c123456789012345678935"),
    societyAccountId: ObjectId("65c123456789012345678901"),
    submittedBy: ObjectId("65c123456789012345678921"),
    submissionDate: ISODate("2026-02-01T09:00:00.000Z"),
    submissionImages: [
      {
        url: "http://localhost:3000/uploads/verification/meter_007.jpg",
        uploadedAt: ISODate("2026-02-01T09:00:00.000Z"),
        label: "meter_reading"
      },
      {
        url: "http://localhost:3000/uploads/verification/composter_007.jpg",
        uploadedAt: ISODate("2026-02-01T09:00:00.000Z"),
        label: "composter_photo"
      }
    ],
    verificationImages: [],
    gpsMetadata: {
      latitude: 19.0760,
      longitude: 72.8777,
      accuracy: 8,
      timestamp: ISODate("2026-02-01T09:00:00.000Z")
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
    reviewTimestamp: ISODate("2026-02-01T09:01:00.000Z"),
    officerComments: null,
    rejectionReason: null,
    expiresAt: ISODate("2026-02-08T09:00:00.000Z"),
    createdAt: ISODate("2026-02-01T09:00:00.000Z"),
    updatedAt: ISODate("2026-02-01T09:01:00.000Z")
  },
  // REJECTED REPORTS
  {
    _id: ObjectId("65c123456789012345678936"),
    societyAccountId: ObjectId("65c123456789012345678903"),
    submittedBy: ObjectId("65c123456789012345678923"),
    submissionDate: ISODate("2026-01-30T11:00:00.000Z"),
    submissionImages: [
      {
        url: "http://localhost:3000/uploads/verification/meter_009.jpg",
        uploadedAt: ISODate("2026-01-30T11:00:00.000Z"),
        label: "meter_reading"
      }
    ],
    verificationImages: [],
    gpsMetadata: {
      latitude: 19.0650,
      longitude: 72.8650,
      accuracy: 25,
      timestamp: ISODate("2026-01-30T11:00:00.000Z")
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
    officerId: ObjectId("65c123456789012345678911"),
    reviewTimestamp: ISODate("2026-01-30T14:00:00.000Z"),
    officerComments: null,
    rejectionReason: "Meter reading unclear. Image quality too poor. Please resubmit with clearer photo.",
    expiresAt: ISODate("2026-02-06T11:00:00.000Z"),
    createdAt: ISODate("2026-01-30T11:00:00.000Z"),
    updatedAt: ISODate("2026-01-30T14:00:00.000Z")
  }
]);

// ============================================
// 5. VERIFY DATA INSERTED
// ============================================
print("✅ Mock data inserted successfully!");
print("\n=== LOGIN CREDENTIALS ===");
print("Officer: rajesh.officer@bmc.gov.in / password123");
print("Officer: priya.officer@bmc.gov.in / password123");
print("========================\n");
print("Data Summary:");
print("- Societies: " + db.societyaccounts.countDocuments());
print("- Officers: " + db.users.countDocuments({role: 12}));
print("- Residents: " + db.users.countDocuments({role: 13}));
print("- Reports: " + db.reports.countDocuments());
print("- Pending Reports: " + db.reports.countDocuments({verificationStatus: "PENDING"}));
print("- Approved Reports: " + db.reports.countDocuments({verificationStatus: "OFFICER_APPROVED"}));
print("- Rejected Reports: " + db.reports.countDocuments({verificationStatus: "REJECTED"}));