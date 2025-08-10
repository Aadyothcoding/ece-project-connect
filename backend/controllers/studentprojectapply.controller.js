import StudentProjectApply from "../models/studentprojectapply.models.js";
import Project from "../models/projectupload.models.js"; // Assuming your existing project model is here
import "../models/auth.models.js"; // Ensure User model is registered

// Apply to a project
export const applyToProject = async (req, res) => {
  try {
    const { studentName, studentId, projectId } = req.body;

    // Check if the project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Check if student already applied
    const existingApplication = await StudentProjectApply.findOne({
      studentId,
      projectId,
    });

    if (existingApplication) {
      return res
        .status(400)
        .json({ message: "You have already applied for this project." });
    }

    const application = new StudentProjectApply({
      studentName,
      studentId,
      projectId,
    });

    await application.save();
    res.status(201).json({ message: "Application submitted", application });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all applications for a project
export const getApplicationsForProject = async (req, res) => {
  try {
    const { projectId } = req.params;

    // 1. Check if project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // 2. Get applications for this project
    const applications = await StudentProjectApply.find({ projectId }).populate(
      "studentId",
      "fullName email"
    );

    // 3. Return project + applications
    res.status(200).json({
      project: {
        _id: project._id,
        title: project.projectTitle,
        facultyName: project.facultyName,
        stream: project.stream,
      },
      applications,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
