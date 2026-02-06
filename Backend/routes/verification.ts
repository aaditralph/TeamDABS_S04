import { Router } from "express";
import {
  submitReport,
  getMyReports,
  getReportById,
  processProofOfLife,
  processVerification,
  submitReportFormData,
} from "../controllers/verificationController.js";
import { protect } from "../middleware/auth.js";
import { authorize } from "../middleware/authorize.js";
import { uploadVerification } from "../middleware/upload.js";
import ROLES_LIST from "../config/roles_list.js";

const router = Router();

router.post(
  "/report",
  protect,
  authorize([ROLES_LIST.society, ROLES_LIST.resident]),
  processProofOfLife
);

router.post(
  "/report/upload",
  protect,
  authorize([ROLES_LIST.society, ROLES_LIST.resident]),
  uploadVerification.fields([
    { name: "meter_image", maxCount: 1 },
    { name: "composter_image", maxCount: 1 },
  ]),
  submitReportFormData
);

router.post(
  "/detect",
  protect,
  authorize([ROLES_LIST.society, ROLES_LIST.resident, ROLES_LIST.officer, ROLES_LIST.admin]),
  processVerification
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
