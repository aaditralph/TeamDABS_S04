import mongoose from "mongoose";
import bcrypt from "bcrypt";
import User from "../models/User.js";
import SocietyAccount from "../models/SocietyAccount.js";
import Report from "../models/Report.js";
import ROLES_LIST from "./roles_list.js";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/genesis";

async function seedMockData() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    await cleanupExistingData();

    const societyUsers = await createSocietyUsers();
    const societies = await createSocieties(societyUsers);
    await createReports(societies, societyUsers);

    console.log("Mock data seeded successfully!");
    console.log("\n=== Created Data Summary ===");
    console.log(`Societies: ${societies.length}`);
    console.log(`Reports: 10 total (6 reviewed, 4 pending)`);
    console.log("\n=== Society Credentials ===");
    societies.forEach((s, i) => {
      console.log(`Society ${i + 1}: ${s.email} / password123`);
    });
  } catch (error) {
    console.error("Error seeding mock data:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

async function cleanupExistingData() {
  console.log("Cleaning up existing data...");
  await Report.deleteMany({});
  await SocietyAccount.deleteMany({});
  await User.deleteMany({
    role: { $in: [ROLES_LIST.society, ROLES_LIST.officer] }
  });
}

async function createSocietyUsers() {
  console.log("Creating society users...");

  const users = [
    {
      name: "Green Valley Manager",
      email: "manager@greenvalley.com",
      password: "password123",
      phone: "9876543210",
      role: ROLES_LIST.society,
      isVerified: true,
      isActive: true,
      societyName: "Green Valley Gardens",
    },
    {
      name: "Sunrise Heights Secretary",
      email: "secretary@sunriseheights.com",
      password: "password123",
      phone: "9876543211",
      role: ROLES_LIST.society,
      isVerified: true,
      isActive: true,
      societyName: "Sunrise Heights",
    },
  ];

  const createdUsers = [];
  for (const userData of users) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);
    const user = await User.create({
      ...userData,
      password: hashedPassword,
    });
    createdUsers.push(user);
    console.log(`  Created user: ${user.email}`);
  }

  return createdUsers;
}

async function createSocieties(societyUsers: typeof User[]) {
  console.log("Creating societies...");

  const societiesData = [
    {
      userId: societyUsers[0]._id,
      societyName: "Green Valley Gardens",
      email: "manager@greenvalley.com",
      phone: "9876543210",
      address: {
        street: "123 Green Avenue",
        city: "Mumbai",
        state: "Maharashtra",
        pincode: "400001",
      },
      geoLockCoordinates: {
        latitude: 19.0760,
        longitude: 72.8777,
      },
      propertyTaxEstimate: 500000,
      electricMeterSerialNumber: "EM-2024-GV001",
      dailyCompostWeight: 45.5,
      walletBalance: 12500,
      totalRebatesEarned: 62500,
      complianceStreak: 12,
      isActive: true,
      isVerified: true,
    },
    {
      userId: societyUsers[1]._id,
      societyName: "Sunrise Heights",
      email: "secretary@sunriseheights.com",
      phone: "9876543211",
      address: {
        street: "456 Sunrise Road",
        city: "Mumbai",
        state: "Maharashtra",
        pincode: "400002",
      },
      geoLockCoordinates: {
        latitude: 19.0896,
        longitude: 72.8656,
      },
      propertyTaxEstimate: 750000,
      electricMeterSerialNumber: "EM-2024-SH001",
      dailyCompostWeight: 62.3,
      walletBalance: 18900,
      totalRebatesEarned: 94500,
      complianceStreak: 8,
      isActive: true,
      isVerified: true,
    },
  ];

  const createdSocieties = [];
  for (const data of societiesData) {
    const society = await SocietyAccount.create(data);
    await User.findByIdAndUpdate(data.userId, { societyId: society._id });
    createdSocieties.push(society);
    console.log(`  Created society: ${society.societyName}`);
  }

  return createdSocieties;
}

async function createReports(
  societies: typeof SocietyAccount[],
  societyUsers: typeof User[]
) {
  console.log("Creating reports...");

  const now = new Date();
  const imageSets = [
    { meter: "meter_sample_1.jpg", composter: "composter_sample_1.jpg" },
    { meter: "meter_sample_2.jpg", composter: "composter_sample_2.jpg" },
    { meter: "meter_1.jpg", composter: "composter_1.jpg" },
    { meter: "meter_2.jpg", composter: "composter_2.jpg" },
    { meter: "meter_1.jpg", composter: "composter_3.jpg" },
  ];

  for (let s = 0; s < societies.length; s++) {
    const society = societies[s];
    const user = societyUsers[s];
    console.log(`  Reports for ${society.societyName}:`);

    for (let i = 0; i < 5; i++) {
      const daysAgo = i * 2;
      const submissionDate = new Date(now);
      submissionDate.setDate(submissionDate.getDate() - daysAgo);

      const baseGPS = {
        latitude: society.geoLockCoordinates.latitude + (Math.random() - 0.5) * 0.001,
        longitude: society.geoLockCoordinates.longitude + (Math.random() - 0.5) * 0.001,
        accuracy: 10 + Math.random() * 15,
        timestamp: submissionDate,
      };

      const isReviewed = i < 3;
      const isApproved = i < 2;
      const images = imageSets[i % imageSets.length];

      const submissionImages = [
        {
          url: `/uploads/verification/${images.meter}`,
          uploadedAt: submissionDate,
          gpsMetadata: baseGPS,
          label: "meter_image",
        },
        {
          url: `/uploads/verification/${images.composter}`,
          uploadedAt: submissionDate,
          gpsMetadata: baseGPS,
          label: "composter_image",
        },
      ];

      const expiryDate = new Date(now);
      expiryDate.setDate(expiryDate.getDate() + 7);

      const verificationProbability = isApproved ? 65 + Math.random() * 25 : 35 + Math.random() * 20;
      const aiTrustScore = verificationProbability * 0.95 + Math.random() * 5;

      const reportData: any = {
        societyAccountId: society._id,
        submittedBy: user._id,
        submissionDate,
        submissionImages,
        gpsMetadata: baseGPS,
        verificationProbability,
        aiTrustScore,
        expiresAt: expiryDate,
        notifiedOfficers: [],
        iotSensorData: {
          deviceId: `IOT-${society.societyName.substring(0, 3).toUpperCase()}-${i + 1}`,
          deviceType: "VIBRATION_SENSOR",
          vibrationStatus: Math.random() > 0.3 ? "DETECTED" : "NOT_DETECTED",
          sensorValue: 45 + Math.random() * 30,
          batteryLevel: 75 + Math.random() * 25,
          timestamp: submissionDate,
          isOnline: Math.random() > 0.1,
        },
      };

      if (isReviewed) {
        if (isApproved) {
          reportData.verificationStatus = i === 0 ? "OFFICER_APPROVED" : "AUTO_APPROVED";
          reportData.approvalType = i === 0 ? "OFFICER" : "AUTOMATIC";
          reportData.rebateAmount = Math.round(society.propertyTaxEstimate * 0.05 * 0.9);
          reportData.approvedDays = 30;
          reportData.reviewTimestamp = new Date(submissionDate.getTime() + 24 * 60 * 60 * 1000);
          reportData.officerComments = i === 0 ? "Verified and approved. Good compost quality maintained." : null;
          reportData.n8nWebhookResponse = {
            webhookId: `n8n_${Date.now()}_${i}`,
            workflowId: "verification_workflow_1",
            status: "completed",
            detectionResults: {
              meterResults: [{ confidence: verificationProbability * 0.01 }],
              composterResults: [{ confidence: verificationProbability * 0.012 }],
            },
            aiTrustScore,
            verificationProbability,
            processedAt: new Date(submissionDate.getTime() + 1000),
          };
        } else {
          reportData.verificationStatus = "REJECTED";
          reportData.approvalType = "OFFICER";
          reportData.rejectionReason = "Insufficient compost level detected. Please submit fresh report.";
          reportData.reviewTimestamp = new Date(submissionDate.getTime() + 24 * 60 * 60 * 1000);
          reportData.officerComments = "Report rejected. Check composter and resubmit.";
        }
      } else {
        reportData.verificationStatus = "PENDING";
        reportData.approvalType = "NONE";
      }

      const report = await Report.create(reportData);
      console.log(`    Report ${i + 1}: ${reportData.verificationStatus} (Score: ${verificationProbability.toFixed(1)}%)`);
    }
  }
}

seedMockData();
