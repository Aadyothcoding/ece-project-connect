// projectupload.routes.js
import express from "express";
import {
  createProject,
  getAllProjects,
  getProjectById,
  updateProject,
  deleteProject,
} from "../controllers/projectupload.controller.js";
import { validateProjectData } from "../middlewares/projectupload.middleware.js";
import { protectRoute } from "../middlewares/auth.middlewares.js";

const router = express.Router();

// POST - create new project
router.post("/", protectRoute,validateProjectData, createProject);

// GET - fetch all projects
router.get("/", protectRoute,getAllProjects);

// GET - fetch single project by ID
router.get("/:id", protectRoute,getProjectById);

// PUT - update project
router.put("/:id", protectRoute,validateProjectData, updateProject);

// DELETE - delete project
router.delete("/:id", protectRoute,deleteProject);

export default router;
