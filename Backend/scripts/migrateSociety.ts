import mongoose from "mongoose";
import type { Document, ObjectId } from "mongoose";
import User from "../models/User.js";
import BwgSociety from "../models/BwgSociety.js";
import EvidenceLog from "../models/EvidenceLog.js";
import SocietyProfile from "../models/SocietyProfile.js";

const migrateSocietyData = async (): Promise<void> => {
  console.log("Starting society data migration...");

  try {
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/genesis");

    const societyWorkers = await User.find({
      role: 14,
      isActive: true,
    }).lean();

    console.log(`Found ${societyWorkers.length} society workers to migrate`);

    const societyMap = new Map<string, mongoose.Types.ObjectId>();

    for (const worker of societyWorkers) {
      const key = `${worker.societyName || "Unknown"}-${(worker as any).societyName || "Unknown"}`;

      if (!societyMap.has(key)) {
        const society = await BwgSociety.findOne({
          societyName: worker.societyName,
        });

        if (!society) {
          const newSociety = await BwgSociety.create({
            name: worker.name,
            email: worker.email,
            phone: worker.phone,
            societyName: worker.societyName || "Unknown Society",
            address: {
              street: "",
              city: "",
              state: "",
              pincode: "",
            },
            geoLockCoordinates: {
              latitude: 0,
              longitude: 0,
            },
            walletBalance: 0,
            totalRebatesEarned: 0,
            complianceStreak: 0,
            isActive: true,
          });

          societyMap.set(key, newSociety._id as mongoose.Types.ObjectId);
          console.log(`Created society: ${newSociety.societyName}`);
        } else {
          societyMap.set(key, society._id as mongoose.Types.ObjectId);
        }
      }

      const societyId = societyMap.get(key);

      if (societyId) {
        await User.updateOne(
          { _id: worker._id },
          { societyId }
        );
        console.log(`Updated worker ${worker.name} with societyId`);

        await SocietyProfile.updateOne(
          { userId: worker._id },
          { userId: societyId }
        );
        console.log(`Updated society profile for ${worker.name}`);
      }
    }

    const evidenceLogs = await EvidenceLog.find({
      societyId: { $exists: true },
    }).lean();

    console.log(`Found ${evidenceLogs.length} evidence logs to update`);

    for (const log of evidenceLogs) {
      const worker = await User.findById(log.societyId).lean();

      if (worker && worker.societyId) {
        await EvidenceLog.updateOne(
          { _id: log._id },
          { societyId: worker.societyId }
        );
        console.log(`Updated evidence log ${log._id}`);
      }
    }

    console.log("Migration completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
};

migrateSocietyData();