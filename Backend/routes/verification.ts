import { Router } from "express";
import {
  submitReport,
  getMyReports,
  getReportById,
  processProofOfLife,
} from "../controllers/verificationController.js";
import { protect } from "../middleware/auth.js";
import { authorize } from "../middleware/authorize.js";
import ROLES_LIST from "../config/roles_list.js";

const router = Router();

router.post(
  "/report",
  protect,
  authorize([ROLES_LIST.society, ROLES_LIST.resident]),
  processProofOfLife
);

router.get(
  "/reports/my",
  protect,
  authorize([ROLES_LIST.society, ROLES_LIST.resident]),
  getMyReports
);

router.get(
  "/reports/:id",
  protect,
  authorize([ROLES_LIST.society, ROLES_LIST.resident, ROLES_LIST.officer, ROLES_LIST.admin]),
  getReportById
);

export default router;
