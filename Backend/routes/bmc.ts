import { Router } from "express";
import {
  getPendingReviews,
  submitReview,
  getReportsHistory,
  getAllReports,
  expireOldReports,
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

export default router;
