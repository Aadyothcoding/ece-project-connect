import StudentProjectApply from "../models/studentprojectapply.models.js";
import Project from "../models/projectupload.models.js"; // Assuming your existing project model is here

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

    const applications = await StudentProjectApply.find({ projectId }).populate(
      "studentId",
      "name email"
    );

    res.status(200).json(applications);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
