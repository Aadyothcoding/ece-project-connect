import express from "express";
import {
  applyToProject,
  getApplicationsForProject,
} from "../controllers/studentprojectapply.controller.js";
import { checkProjectCapacity } from "../middlewares/studentprojectapply.middleware.js";

const router = express.Router();

// Apply to a project
router.post("/apply", checkProjectCapacity, applyToProject);

// Get all applications for a project
router.get("/:projectId", getApplicationsForProject);

export default router;
