// controllers/teamapproved.controller.js
import StudentProjectApply from "../models/studentprojectapply.models.js";
import TeamApproved from "../models/teamapproved.model.js";

// ✅ Approve an application
export const approveApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;

    const application = await StudentProjectApply.findById(
      applicationId
    ).populate("projectId");
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    // Create entry in TeamApproved
    const approvedTeam = new TeamApproved({
      projectId: application.projectId._id,
      facultyName: application.projectId.facultyName,
      applicationType: application.applicationType,
      members: application.members.map((m) => ({
        studentId: m.studentId,
        name: m.name,
        regNo: m.regNo,
      })),
    });

    await approvedTeam.save();

    // Delete from studentprojectapplies
    await StudentProjectApply.findByIdAndDelete(applicationId);

    res.status(201).json({
      message: "Application approved and moved to TeamApproved",
      approvedTeam,
    });
  } catch (err) {
    console.error("Approve error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ❌ Reject an application
export const rejectApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;

    const application = await StudentProjectApply.findById(applicationId);
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    await StudentProjectApply.findByIdAndDelete(applicationId);

    res.status(200).json({ message: "Application rejected and deleted" });
  } catch (err) {
    console.error("Reject error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// 📌 Fetch all approved teams
export const getApprovedTeams = async (req, res) => {
  try {
    const teams = await TeamApproved.find()
      .populate("projectId")
      .populate("members.studentId");
    res.status(200).json({ teams });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
