/*import express from "express";
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
*/

import express from "express";
import {
  applyToProject,
  getApplicationsForProject,
  getPendingInvitations,
  respondToInvitation,
} from "../controllers/studentprojectapply.controller.js";
import { protectRoute } from "../middlewares/auth.middlewares.js";

const router = express.Router();

// --- Student Specific Routes ---
// A logged-in student applies to a project
router.post("/apply", protectRoute, applyToProject);

// A logged-in student gets their pending group invitations
router.get("/invitations", protectRoute, getPendingInvitations);

// A logged-in student responds (accepts/rejects) an invitation
router.post("/invitations/respond", protectRoute, respondToInvitation);


// --- Teacher Specific Route ---
// A logged-in teacher gets all applications for one of their projects
router.get("/:projectId", protectRoute, getApplicationsForProject);

export default router;