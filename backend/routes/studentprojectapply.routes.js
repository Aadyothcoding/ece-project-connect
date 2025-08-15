import express from "express";
import {
  applyToProject,
  getApplicationsForProject,
  verifyGroupApplication, // Import the new controller
} from "../controllers/studentprojectapply.controller.js";
import { protectRoute } from "../middlewares/auth.middlewares.js"; // Middleware to protect routes

const router = express.Router();

// A logged-in student can apply to a project (individual or group)
router.post("/apply", protectRoute, applyToProject);

// A student member clicks this link from their email to verify
router.get("/verify/:applicationId/:memberId/:token", verifyGroupApplication);

// A teacher gets all applications for a specific project
router.get("/:projectId", getApplicationsForProject);

export default router;
