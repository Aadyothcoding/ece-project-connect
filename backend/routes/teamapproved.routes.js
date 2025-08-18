// routes/teamapproved.routes.js
import express from "express";
import {
  approveApplication,
  rejectApplication,
  getApprovedTeams,
} from "../controllers/teamapproved.controller.js";
import { validateApplicationExists } from "../middlewares/teamapproved.middleware.js";

const router = express.Router();

// ✅ Approve and move to TeamApproved
router.post(
  "/approve/:applicationId",
  validateApplicationExists,
  approveApplication
);

// ❌ Reject and delete
router.post(
  "/reject/:applicationId",
  validateApplicationExists,
  rejectApplication
);

// 📌 Get all approved teams
router.get("/", getApprovedTeams);

export default router;
