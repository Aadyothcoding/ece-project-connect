// routes/usersearch.routes.js
import express from "express";
import { searchUsers } from "../controllers/usersearch.controller.js";
import { validateSearchQuery } from "../middlewares/usersearch.middleware.js";

const router = express.Router();

// GET /api/usersearch?q=...
router.get("/", validateSearchQuery, searchUsers);

export default router;
