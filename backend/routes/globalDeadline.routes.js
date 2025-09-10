// routes/globalDeadline.routes.js
import express from "express";
import { protectRoute } from "../middlewares/auth.middlewares.js";
import { getGlobalDeadline, setGlobalDeadline } from "../controllers/globalDeadline.controller.js";

const router = express.Router();

router.get("/", getGlobalDeadline);
router.post("/", protectRoute, setGlobalDeadline);

export default router;
