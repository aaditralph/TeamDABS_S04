import { Router } from "express";
import {
  register,
  login,
  getMe,
  getSocietyInfo,
} from "../controllers/societyController.js";
import { protect } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { authLimiter } from "../middleware/rateLimiter.js";
import {
  societyRegisterSchema,
  societyLoginSchema,
} from "../utils/validation.js";

const router = Router();

router.post(
  "/register",
  authLimiter,
  validate(societyRegisterSchema),
  register
);
router.post("/login", authLimiter, validate(societyLoginSchema), login);
router.get("/me", protect, getMe);
router.get("/society", protect, getSocietyInfo);

export default router;
