// controllers/projectupload.controller.js
import mongoose from "mongoose";
import Project from "../models/projectupload.models.js";
import StudentProjectApply from "../models/studentprojectapply.models.js";
import TeamApproved from "../models/teamapproved.model.js";

/**
 * @desc    Create a new project
 * @route   POST /api/projects
 * @access  Private (Teacher)
 * @note    This function now automatically links the project to the logged-in teacher.
 */
const createProject = async (req, res) => {
  try {
    const { projectTitle, description, stream, domain } = req.body;

    const teacherId = req.user._id;
    const facultyName = req.user.fullName;

    const newProject = new Project({
      projectTitle,
      description,
      stream,
      domain,
      teacherId,
      facultyName,
    });

    const savedProject = await newProject.save();
    res.status(201).json(savedProject);
  } catch (error) {
    console.error("Error in createProject:", error.message);
    res
      .status(500)
      .json({ message: "Error creating project", error: error.message });
  }
};

/**
 * @desc    Get all available projects (exclude those already applied/approved)
 * @route   GET /api/projects
 * @access  Private (Student)
 */
const getAllProjects = async (req, res) => {
  try {
    const studentId = req.user._id;

    const approvedProjects = await TeamApproved.distinct("projectId");

    const overAppliedProjects = await StudentProjectApply.aggregate([
      {
        $group: {
          _id: "$projectId",
          count: { $sum: 1 },
        },
      },
      { $match: { count: { $gt: 2 } } },
      { $project: { _id: 1 } },
    ]);
    const overAppliedIds = overAppliedProjects.map((p) => p._id);

    const studentAppliedProjects = await StudentProjectApply.distinct(
      "projectId",
      { "members.studentId": new mongoose.Types.ObjectId(studentId) }
    );

    const excludedIds = [
      ...new Set([
        ...approvedProjects,
        ...overAppliedIds,
        ...studentAppliedProjects,
      ]),
    ];

    const projects = await Project.find({
      _id: { $nin: excludedIds },
    })
      .populate('teacherId', '_id fullName email department experience researchPast srmWebsite')
      .sort({ createdAt: -1 });

    res.status(200).json(projects);
  } catch (error) {
    console.error("Error in getAllProjects:", error.message);
    res
      .status(500)
      .json({ message: "Error fetching projects", error: error.message });
  }
};

/**
 * @desc    Get all projects for the currently logged-in teacher
 * @route   GET /api/projects/my-projects
 * @access  Private (Teacher)
 */
const getProjectsByTeacher = async (req, res) => {
  try {
    const projects = await Project.find({ teacherId: req.user._id }).sort({
      createdAt: -1,
    });
    res.status(200).json(projects);
  } catch (error) {
    console.error("Error in getProjectsByTeacher:", error.message);
    res.status(500).json({
      message: "Error fetching teacher's projects",
      error: error.message,
    });
  }
};

/**
 * @desc    Get a single project by its ID
 * @route   GET /api/projects/:id
 * @access  Private
 */
const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    res.status(200).json(project);
  } catch (error) {
    console.error("Error in getProjectById:", error.message);
    res
      .status(500)
      .json({ message: "Error fetching project", error: error.message });
  }
};

/**
 * @desc    Update a project
 * @route   PUT /api/projects/:id
 * @access  Private (Teacher)
 */
const updateProject = async (req, res) => {
  try {
    const { projectTitle, description, stream, domain } = req.body;
    const updateFields = { projectTitle, description, stream, domain };

    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true, runValidators: true }
    );
    if (!updatedProject) {
      return res.status(404).json({ message: "Project not found" });
    }
    res.status(200).json(updatedProject);
  } catch (error) {
    console.error("Error in updateProject:", error.message);
    res
      .status(500)
      .json({ message: "Error updating project", error: error.message });
  }
};

/**
 * @desc    Delete a project + cleanup related applications & teams
 * @route   DELETE /api/projects/:id
 * @access  Private (Teacher)
 */
const deleteProject = async (req, res) => {
  try {
    const projectId = req.params.id;

    const deletedProject = await Project.findByIdAndDelete(projectId);
    if (!deletedProject) {
      return res.status(404).json({ message: "Project not found" });
    }

    await StudentProjectApply.deleteMany({ projectId });
    await TeamApproved.deleteMany({ projectId });

    res.status(200).json({
      message: "Project and related applications/teams deleted successfully",
    });
  } catch (error) {
    console.error("Error in deleteProject:", error.message);
    res
      .status(500)
      .json({ message: "Error deleting project", error: error.message });
  }
};

export {
  createProject,
  getAllProjects,
  getProjectsByTeacher,
  getProjectById,
  updateProject,
  deleteProject,
};
