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

const router = express.Router();

// POST - create new project
router.post("/", validateProjectData, createProject);

// GET - fetch all projects
router.get("/", getAllProjects);

// GET - fetch single project by ID
router.get("/:id", getProjectById);

// PUT - update project
router.put("/:id", validateProjectData, updateProject);

// DELETE - delete project
router.delete("/:id", deleteProject);

export default router;
