import express from "express";
import { getStudentInfo } from "../controllers/info.controller.js";
import { authorizeInfoAccess } from "../middlewares/info.middleware.js";
import { protectRoute } from "../middlewares/auth.middlewares.js";

const router = express.Router();

// GET /api/info/:id
router.get("/:id", protectRoute, authorizeInfoAccess, getStudentInfo);

export default router;
