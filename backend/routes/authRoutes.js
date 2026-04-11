import express from "express";
import {
  register,
  verifyEmail,
  resendOTP,
  login,
  refreshToken,
  forgotPassword,
  getProfile,
} from "../contollers/authController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.post("/register", register);
router.post("/login", login);
router.post("/verify-email", verifyEmail);
router.post("/resend-otp", resendOTP);
router.post("/refresh-token", refreshToken);
router.post("/forgot-password", forgotPassword);

// Private routes
router.get("/profile", authMiddleware, getProfile);

export default router;
