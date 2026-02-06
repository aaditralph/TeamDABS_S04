import { Router } from "express";
import { getReportsHistory } from "../controllers/bmcController.js";
import { protect } from "../middleware/auth.js";
import { authorize } from "../middleware/authorize.js";
import ROLES_LIST from "../config/roles_list.js";

const router = Router();

router.get(
  "/history/:societyId",
  protect,
  authorize([ROLES_LIST.officer, ROLES_LIST.admin]),
  getReportsHistory
);

export default router;
