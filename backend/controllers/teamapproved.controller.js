// controllers/teamapproved.controller.js
import StudentProjectApply from "../models/studentprojectapply.models.js";
import TeamApproved from "../models/teamapproved.model.js";
import Notification from "../models/notifications.model.js";

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

    // Send notifications to all members 🚀
    for (const member of application.members) {
      await Notification.create({
        userId: member.studentId,
        title: "Project Application Approved",
        message: `Your application for project "${application.projectId.projectTitle}" has been approved by ${application.projectId.facultyName}.`,
        type: "success",
      });
    }

    // Delete from studentprojectapplies
    await StudentProjectApply.findByIdAndDelete(applicationId);

    res.status(201).json({
      message: "Application approved, team created, and notifications sent",
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

    const application = await StudentProjectApply.findById(
      applicationId
    ).populate("projectId");
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    // Send rejection notifications 🚨
    for (const member of application.members) {
      await Notification.create({
        userId: member.studentId,
        title: "Project Application Rejected",
        message: `Your application for project "${application.projectId?.projectTitle}" has been rejected by ${application.projectId?.facultyName}.`,
        type: "error",
      });
    }

    // Delete application
    await StudentProjectApply.findByIdAndDelete(applicationId);

    res
      .status(200)
      .json({ message: "Application rejected and notifications sent" });
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
