// routes/notification.routes.js
import express from "express";
import {
  createNotification,
  getUserNotifications,
  deleteNotification,
} from "../controllers/notification.controller.js";
import { protectRoute } from "../middlewares/auth.middlewares.js"; // ✅ use cookie-based auth

const router = express.Router();

// POST /api/notifications → create a new notification
router.post("/create", protectRoute, createNotification);

// GET /api/notifications/me → fetch logged-in user’s notifications
router.get("/me", protectRoute, getUserNotifications);

// DELETE /api/notifications/:notificationId → delete/dismiss a notification
router.delete("/:notificationId", protectRoute, deleteNotification);

export default router;
