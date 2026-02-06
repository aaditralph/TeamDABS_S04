import { Router } from "express";
import { register, login, getMe, updateAddress } from "../controllers/customerController.js";
import { protect } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { authLimiter } from "../middleware/rateLimiter.js";
import { customerRegisterSchema, customerLoginSchema, addressSchema } from "../utils/validation.js";

const router = Router();

router.post("/register", authLimiter, validate(customerRegisterSchema), register);
router.post("/login", authLimiter, validate(customerLoginSchema), login);
router.get("/me", protect, getMe);
router.put("/address", protect, validate(addressSchema), updateAddress);

export default router;
