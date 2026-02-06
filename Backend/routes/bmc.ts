import { Router } from "express";
import { getPendingReviews, submitReview } from "../controllers/bmcController.js";
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

export default router;
