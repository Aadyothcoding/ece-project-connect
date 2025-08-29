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

    // ✅ Create entry in TeamApproved
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

    // ✅ Send notifications to all members
    for (const member of application.members) {
      await Notification.create({
        userId: member.studentId,
        title: "Project Application Approved",
        message: `Your application for project "${application.projectId.projectTitle}" has been approved by ${application.projectId.facultyName}.`,
        type: "success",
      });
    }

    // ✅ Collect member IDs
    const memberIds = application.members.map((m) => m.studentId);

    // ✅ Delete ALL applications where these members are present
    await StudentProjectApply.deleteMany({
      "members.studentId": { $in: memberIds },
    });

    res.status(201).json({
      message:
        "Application approved, team created, notifications sent, and all other applications of these members deleted.",
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

    const application = await StudentProjectApply.findById(applicationId)
      .populate("projectId")
      .populate("members.studentId");

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    const leaderId = application.members[0].studentId;

    // Notify rejection
    for (const member of application.members) {
      await Notification.create({
        userId: member.studentId,
        title: "Project Application Rejected",
        message: `Your Priority ${application.priority} application for project "${application.projectId?.projectTitle}" has been rejected.`,
        type: "error",
      });
    }

    // Delete the application
    await StudentProjectApply.findByIdAndDelete(applicationId);

    // 🚨 If this was priority 1, check if student has a priority 2 application
    if (application.priority === 1) {
      const priority2 = await StudentProjectApply.findOne({
        "members.studentId": leaderId,
        priority: 2,
      }).populate("projectId");

      if (priority2) {
        // Notify faculty about priority 2
        console.log(
          `Faculty ${priority2.projectId.facultyName} notified about Priority 2 application`
        );
      }
    }

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

// ✅ Remove a member from an approved team
export const removeMemberFromTeam = async (req, res) => {
  try {
    const { teamId, memberId } = req.params;

    const updatedTeam = await TeamApproved.findByIdAndUpdate(
      teamId,
      { $pull: { members: { studentId: memberId } } },
      { new: true }
    )
      .populate("projectId")
      .populate("members.studentId");

    if (!updatedTeam) {
      return res.status(404).json({ message: "Team not found" });
    }

    // Send notification to removed member 🚨
    await Notification.create({
      userId: memberId,
      title: "Removed from Team",
      message: `You have been removed from the project "${updatedTeam.projectId.projectTitle}" by ${updatedTeam.facultyName}.`,
      type: "warning",
    });

    res.status(200).json({
      message: "Member removed successfully",
      team: updatedTeam,
    });
  } catch (err) {
    console.error("Remove member error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ➕ Add member to approved team
export const addMemberToTeam = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { studentId } = req.body;

    const team = await TeamApproved.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    // Check if student already in ANY team
    const alreadyInTeam = await TeamApproved.findOne({
      "members.studentId": studentId,
    });

    if (alreadyInTeam) {
      return res.status(400).json({
        message: "This student is already part of another approved team",
      });
    }

    // Get student info from User model
    const User = (await import("../models/auth.models.js")).default;
    const student = await User.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Add member
    team.members.push({
      studentId: student._id,
      name: student.fullName,
      regNo: student.regNo,
    });

    await team.save();
    await team.populate("projectId members.studentId");

    // Notify student
    await Notification.create({
      userId: student._id,
      title: "Added to Project Team",
      message: `You have been added to the project "${team.projectId.projectTitle}" by ${team.facultyName}.`,
      type: "info",
    });

    res.status(200).json({ message: "Member added successfully", team });
  } catch (err) {
    console.error("Add member error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
