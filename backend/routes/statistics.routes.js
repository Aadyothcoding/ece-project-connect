// routes/statistics.routes.js
import express from "express";
import { getStatistics } from "../controllers/statistics.controller.js";
import { protectRoute } from "../middlewares/auth.middlewares.js";

const router = express.Router();

// Only authenticated users can access statistics
router.get("/", protectRoute, getStatistics);

export default router;
