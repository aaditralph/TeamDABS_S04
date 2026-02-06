import { Router } from "express";
import {
  login,
  getPendingOfficers,
  approveOfficer,
  rejectOfficer,
  getPendingSocieties,
  approveSociety,
  rejectSociety,
  getAllSocieties,
} from "../controllers/adminController.js";
import { protect } from "../middleware/auth.js";
import { authorize } from "../middleware/authorize.js";
import { validate } from "../middleware/validate.js";
import { authLimiter } from "../middleware/rateLimiter.js";
import { adminLoginSchema } from "../utils/validation.js";
import ROLES_LIST from "../config/roles_list.js";

const router = Router();

// Admin login (no registration - only DABS exists)
router.post("/login", authLimiter, validate(adminLoginSchema), login);

// Protected admin routes
router.get(
  "/pending-officers",
  protect,
  authorize([ROLES_LIST.admin]),
  getPendingOfficers,
);

router.put(
  "/approve-officer/:id",
  protect,
  authorize([ROLES_LIST.admin]),
  approveOfficer,
);

router.delete(
  "/reject-officer/:id",
  protect,
  authorize([ROLES_LIST.admin]),
  rejectOfficer,
);

router.get(
  "/pending-societies",
  protect,
  authorize([ROLES_LIST.admin]),
  getPendingSocieties,
);

router.put(
  "/approve-society/:id",
  protect,
  authorize([ROLES_LIST.admin]),
  approveSociety,
);

router.delete(
  "/reject-society/:id",
  protect,
  authorize([ROLES_LIST.admin]),
  rejectSociety,
);

router.get(
  "/societies",
  protect,
  authorize([ROLES_LIST.admin]),
  getAllSocieties,
);

export default router;
