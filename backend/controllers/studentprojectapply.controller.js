import StudentProjectApply from "../models/studentprojectapply.models.js";
import Project from "../models/projectupload.models.js";
import User from "../models/auth.models.js";

// The applyToProject function now creates pending invitations without sending emails.
export const applyToProject = async (req, res) => {
  try {
    const { projectId, applicationType, members } = req.body;
    const leader = req.user;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found." });
    }

    const leaderAlreadyApplied = await StudentProjectApply.findOne({
      projectId,
      "members.studentId": leader._id,
    });
    if (leaderAlreadyApplied) {
      return res.status(400).json({ message: "You have already applied for this project." });
    }

    const memberList = [{
      studentId: leader._id,
      name: leader.fullName,
      regNo: leader.regNo || 'N/A',
      status: "approved",
    }];

    if (applicationType === "group") {
      if (!members || members.length !== 2) {
        return res.status(400).json({ message: "A group application must include exactly two other members." });
      }
      
      for (const member of members) {
        const memberUser = await User.findOne({ regNo: member.regNo });
        if (!memberUser) {
          return res.status(404).json({ message: `Student with Reg No "${member.regNo}" not found.` });
        }
        const teammateAlreadyApplied = await StudentProjectApply.findOne({
          projectId,
          "members.studentId": memberUser._id,
        });
        if (teammateAlreadyApplied) {
          return res.status(400).json({ message: `Student ${memberUser.fullName} has already applied for this project.` });
        }
        memberList.push({
          studentId: memberUser._id,
          name: memberUser.fullName,
          regNo: memberUser.regNo,
          status: "pending",
        });
      }
    }

    const application = new StudentProjectApply({
      projectId,
      applicationType,
      members: memberList,
      status: applicationType === 'group' ? 'pending_member_approval' : 'pending_faculty_approval',
    });

    await application.save();

    res.status(201).json({ 
        message: applicationType === 'group' 
            ? "Group application initiated! Your teammates will be notified on their dashboard." 
            : "Application submitted successfully!",
        application 
    });

  } catch (error) {
    console.error("Apply to project error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// NEW: Get all pending invitations for the logged-in student
export const getPendingInvitations = async (req, res) => {
    try {
        const studentId = req.user._id;
        const invitations = await StudentProjectApply.find({
            "members.studentId": studentId,
            "members.status": "pending"
        }).populate('projectId', 'projectTitle facultyName');

        // Filter to format the response correctly for the frontend
        const formattedInvitations = invitations.map(app => {
            const member = app.members.find(m => m.studentId.equals(studentId));
            const leader = app.members[0];
            return {
                applicationId: app._id,
                memberId: member._id,
                projectTitle: app.projectId.projectTitle,
                facultyName: app.projectId.facultyName,
                leaderName: leader.name,
            };
        });

        res.status(200).json(formattedInvitations);
    } catch (error) {
        res.status(500).json({ message: "Server error fetching invitations.", error: error.message });
    }
};

// NEW: Respond to an invitation (accept or reject)
export const respondToInvitation = async (req, res) => {
    try {
        const { applicationId, memberId, response } = req.body;
        const studentId = req.user._id;

        if (!['approved', 'rejected'].includes(response)) {
            return res.status(400).json({ message: "Invalid response." });
        }

        const application = await StudentProjectApply.findById(applicationId);
        if (!application) {
            return res.status(404).json({ message: "Application not found." });
        }

        const member = application.members.id(memberId);
        if (!member || !member.studentId.equals(studentId)) {
            return res.status(403).json({ message: "You are not authorized to respond to this invitation." });
        }

        if (response === 'approved') {
            member.status = 'approved';
            
            const allMembersApproved = application.members.every(m => m.status === 'approved');
            if (allMembersApproved) {
                application.status = 'pending_faculty_approval';
                // TODO: Notify the faculty member
                console.log(`NOTIFY FACULTY: Application ${application._id} is ready for review.`);
            }
        } else { // 'rejected'
            // If one member rejects, the entire application is removed.
            await StudentProjectApply.findByIdAndDelete(applicationId);
            // TODO: Notify the group leader that their application was rejected by a teammate.
            return res.status(200).json({ message: "You have rejected the invitation. The application has been withdrawn." });
        }

        await application.save();
        res.status(200).json({ message: "You have successfully accepted the invitation!" });

    } catch (error) {
        res.status(500).json({ message: "Server error responding to invitation.", error: error.message });
    }
};


export const getApplicationsForProject = async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ message: "Access denied. Only teachers can view applications." });
    }
    const { projectId } = req.params;
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    if (project.facultyName !== req.user.fullName) {
        return res.status(403).json({ message: "Access denied. You can only view applications for your own projects." });
    }
    const applications = await StudentProjectApply.find({ projectId }).populate(
      "members.studentId",
      "fullName email regNo"
    );
    res.status(200).json({
      project: {
        _id: project._id,
        title: project.projectTitle,
        facultyName: project.facultyName,
      },
      applications,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};