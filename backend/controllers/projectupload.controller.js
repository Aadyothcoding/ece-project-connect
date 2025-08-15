// controllers/projectupload.controller.js
import Project from "../models/projectupload.models.js";

/**
 * @desc    Create a new project
 * @route   POST /api/projects
 * @access  Private (Teacher)
 * @note    This function now automatically links the project to the logged-in teacher.
 */
export const createProject = async (req, res) => {
  try {
    // Destructure project details from the request body
    const { projectTitle, description, applicationDeadline, stream, domain } =
      req.body;

    // Get teacher's info from the req.user object (populated by protectRoute middleware)
    const teacherId = req.user._id;
    const facultyName = req.user.fullName;

    // Create a new project instance with the teacher's details
    const newProject = new Project({
      projectTitle,
      description,
      applicationDeadline,
      stream,
      domain,
      teacherId, // Automatically set the teacher's ID
      facultyName, // Automatically set the teacher's name
    });

    // Save the new project to the database
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
 * @desc    Get all projects (for student dashboard)
 * @route   GET /api/projects
 * @access  Private
 */
export const getAllProjects = async (req, res) => {
  try {
    // Find all projects and sort by the most recently created
    const projects = await Project.find().sort({ createdAt: -1 });
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
 * @note    This is a new function for the teacher's dashboard.
 */
export const getProjectsByTeacher = async (req, res) => {
  try {
    // Find projects where the teacherId matches the logged-in user's ID
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
export const getProjectById = async (req, res) => {
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
export const updateProject = async (req, res) => {
  try {
    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true } // Return the updated doc and run schema validators
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
 * @desc    Delete a project
 * @route   DELETE /api/projects/:id
 * @access  Private (Teacher)
 */
export const deleteProject = async (req, res) => {
  try {
    const deletedProject = await Project.findByIdAndDelete(req.params.id);
    if (!deletedProject) {
      return res.status(404).json({ message: "Project not found" });
    }
    res.status(200).json({ message: "Project deleted successfully" });
  } catch (error) {
    console.error("Error in deleteProject:", error.message);
    res
      .status(500)
      .json({ message: "Error deleting project", error: error.message });
  }
};
