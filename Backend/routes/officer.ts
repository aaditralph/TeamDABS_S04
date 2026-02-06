import { Router } from "express";
import { register, login, getMe } from "../controllers/officerController.js";
import { protect } from "../middleware/auth.js";
import { upload, handleUploadError } from "../middleware/upload.js";
import { validate } from "../middleware/validate.js";
import { authLimiter } from "../middleware/rateLimiter.js";
import { officerRegisterSchema, officerLoginSchema } from "../utils/validation.js";

const router = Router();

router.post(
  "/register",
  authLimiter,
  upload.single("document"),
  handleUploadError,
  validate(officerRegisterSchema),
  register
);

router.post("/login", authLimiter, validate(officerLoginSchema), login);

router.get("/me", protect, getMe);

export default router;
