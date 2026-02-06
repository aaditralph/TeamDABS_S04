import mongoose from "mongoose";
import User from "../models/User.js";

export interface NotificationPayload {
  type: "NEW_REPORT" | "REPORT_REMINDER" | "REPORT_APPROVED" | "REPORT_REJECTED" | "REPORT_EXPIRED";
  reportId: string;
  societyName?: string;
  verificationProbability?: number;
  aiTrustScore?: number;
  submissionDate?: Date;
  expiresAt?: Date;
  daysUntilExpiry?: number;
  message?: string;
}

export interface Notification {
  userId: mongoose.Types.ObjectId;
  type: string;
  payload: NotificationPayload;
  read: boolean;
  createdAt: Date;
}

const NotificationSchema = new mongoose.Schema<Notification>({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  payload: {
    type: Object,
    required: true,
  },
  read: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

NotificationSchema.index({ userId: 1, createdAt: -1 });
NotificationSchema.index({ userId: 1, read: 1 });

const Notification = mongoose.model<Notification>("Notification", NotificationSchema);

export const sendNotificationToOfficer = async (
  officerId: string,
  payload: NotificationPayload
): Promise<void> => {
  try {
    const officer = await User.findById(officerId);

    if (!officer || !officer.isActive) {
      console.warn(`Cannot send notification to inactive officer: ${officerId}`);
      return;
    }

    await Notification.create({
      userId: new mongoose.Types.ObjectId(officerId),
      type: payload.type,
      payload,
      read: false,
    });

    console.log(`Notification sent to officer ${officerId}: ${payload.type}`);

  } catch (error) {
    console.error(`Error sending notification to officer ${officerId}:`, error);
  }
};

export const sendBulkNotificationsToOfficers = async (
  officerIds: string[],
  payload: NotificationPayload
): Promise<{ sent: number; failed: number }> => {
  let sent = 0;
  let failed = 0;

  for (const officerId of officerIds) {
    try {
      await sendNotificationToOfficer(officerId, payload);
      sent++;
    } catch (error) {
      console.error(`Failed to send notification to officer ${officerId}:`, error);
      failed++;
    }
  }

  return { sent, failed };
};

export const getOfficerNotifications = async (
  officerId: string,
  options: { unreadOnly?: boolean; limit?: number; offset?: number } = {}
): Promise<{ notifications: Notification[]; total: number }> => {
  const { unreadOnly = false, limit = 50, offset = 0 } = options;

  const filter: any = { userId: new mongoose.Types.ObjectId(officerId) };
  if (unreadOnly) {
    filter.read = false;
  }

  const [notifications, total] = await Promise.all([
    Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .lean(),
    Notification.countDocuments(filter),
  ]);

  return { notifications, total };
};

export const markNotificationAsRead = async (
  notificationId: string,
  officerId: string
): Promise<boolean> => {
  const result = await Notification.findOneAndUpdate(
    {
      _id: new mongoose.Types.ObjectId(notificationId),
      userId: new mongoose.Types.ObjectId(officerId),
    },
    { read: true },
    { new: true }
  );

  return result !== null;
};

export const markAllNotificationsAsRead = async (officerId: string): Promise<number> => {
  const result = await Notification.updateMany(
    {
      userId: new mongoose.Types.ObjectId(officerId),
      read: false,
    },
    { read: true }
  );

  return result.modifiedCount;
};

export const getUnreadNotificationCount = async (officerId: string): Promise<number> => {
  const count = await Notification.countDocuments({
    userId: new mongoose.Types.ObjectId(officerId),
    read: false,
  });

  return count;
};

export default {
  Notification,
  sendNotificationToOfficer,
  sendBulkNotificationsToOfficers,
  getOfficerNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getUnreadNotificationCount,
};
