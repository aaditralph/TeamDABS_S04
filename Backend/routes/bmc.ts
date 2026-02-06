import { Router } from "express";
import {
  getPendingReviews,
  submitReview,
  getReportsHistory,
  getAllReports,
  expireOldReports,
  getOfficerPendingReports,
  getOfficerReviewedReports,
  getOfficerNotifications,
  markNotificationRead,
  getDashboardStats,
} from "../controllers/bmcController.js";
import { protect } from "../middleware/auth.js";
import { authorize } from "../middleware/authorize.js";
import ROLES_LIST from "../config/roles_list.js";

const router = Router();

router.get(
  "/pending-reviews",
  protect,
  authorize([ROLES_LIST.officer]),
  getPendingReviews
);

router.patch(
  "/review/:id",
  protect,
  authorize([ROLES_LIST.officer]),
  submitReview
);

router.get(
  "/reports/history/:societyId",
  protect,
  authorize([ROLES_LIST.officer, ROLES_LIST.admin]),
  getReportsHistory
);

router.get(
  "/reports",
  protect,
  authorize([ROLES_LIST.officer, ROLES_LIST.admin]),
  getAllReports
);

router.post(
  "/reports/expire",
  protect,
  authorize([ROLES_LIST.admin]),
  expireOldReports
);

router.get(
  "/officer/pending",
  protect,
  authorize([ROLES_LIST.officer]),
  getOfficerPendingReports
);

router.get(
  "/officer/reviewed",
  protect,
  authorize([ROLES_LIST.officer]),
  getOfficerReviewedReports
);

router.get(
  "/officer/notifications",
  protect,
  authorize([ROLES_LIST.officer]),
  getOfficerNotifications
);

router.patch(
  "/officer/notifications/:id/read",
  protect,
  authorize([ROLES_LIST.officer]),
  markNotificationRead
);

router.get(
  "/officer/dashboard",
  protect,
  authorize([ROLES_LIST.officer]),
  getDashboardStats
);

export default router;
