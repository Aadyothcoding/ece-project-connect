import express from "express";
import { getStudentInfo, getTeacherInfo } from "../controllers/info.controller.js";
import { authorizeInfoAccess } from "../middlewares/info.middleware.js";
import { protectRoute } from "../middlewares/auth.middlewares.js";

const router = express.Router();

// GET /api/info/teacher/:id
router.get("/teacher/:id", getTeacherInfo);

// GET /api/info/:id
router.get("/:id", protectRoute, authorizeInfoAccess, getStudentInfo);

export default router;
