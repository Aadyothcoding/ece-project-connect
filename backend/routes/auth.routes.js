import express from "express";
import {
  signup,
  login,
  logout,
  updateProfile,
  checkAuth,
  verifyEmail,
  forgotPassword,
  resetPassword
} from "../controllers/auth.controllers.js";
import { protectRoute } from "../middlewares/auth.middlewares.js";

const router = express.Router();

// ─── Public Routes ──────────────────────────────────────────────

// Signup now supports "role" (teacher/student) in the body
router.post("/signup", signup);

// Login with email & password
router.post("/login", login);

// Forgot & Reset Password
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// Email verification link
router.get("/verify", verifyEmail);
router.get("/check-auth", protectRoute, checkAuth);
// ─── Protected Routes ───────────────────────────────────────────

// Logout
router.post("/logout", protectRoute, logout);

// Update profile (can also update role if allowed)
router.put("/update-profile", protectRoute, updateProfile);

// Check authentication (returns user data including role)
router.get("/check", protectRoute, checkAuth);

export default router;
