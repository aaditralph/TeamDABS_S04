import { Router } from "express";
import { register, login, getMe, updateSociety } from "../controllers/residentController.js";
import { protect } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { authLimiter } from "../middleware/rateLimiter.js";
import { residentRegisterSchema, residentLoginSchema, updateSocietySchema } from "../utils/validation.js";

const router = Router();

router.post("/register", authLimiter, validate(residentRegisterSchema), register);
router.post("/login", authLimiter, validate(residentLoginSchema), login);
router.get("/me", protect, getMe);
router.put("/society", protect, validate(updateSocietySchema), updateSociety);

export default router;
