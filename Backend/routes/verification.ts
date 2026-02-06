import { Router } from "express";
import { processProofOfLife } from "../controllers/verificationController.js";
import { protect } from "../middleware/auth.js";
import { authorize } from "../middleware/authorize.js";
import { validate } from "../middleware/validate.js";
import ROLES_LIST from "../config/roles_list.js";

const router = Router();

router.post(
  "/proof-of-life",
  protect,
  authorize([ROLES_LIST.society]),
  processProofOfLife
);

export default router;
