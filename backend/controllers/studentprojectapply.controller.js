import StudentProjectApply from "../models/studentprojectapply.models.js";
import Project from "../models/projectupload.models.js";
import User from "../models/auth.models.js";

// The applyToProject function now creates pending invitations without sending emails.
export const applyToProject = async (req, res) => {
  try {
    const { projectId, applicationType, members } = req.body;
    const leader = req.user;

    // Count how many times student has applied
    const existingApps = await StudentProjectApply.find({
      "members.studentId": leader._id,
    });

    if (existingApps.length >= 2) {
      return res.status(400).json({
        message: "You can only apply for up to 2 projects (Priority 1 & 2).",
      });
    }

    // Auto-assign priority
    const priority = existingApps.length === 0 ? 1 : 2;

    // Prevent duplicate priority (just in case)
    if (existingApps.some((a) => a.priority === priority)) {
      return res
        .status(400)
        .json({ message: `You already applied for Priority ${priority}.` });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found." });
    }

    // Build members list
    const memberList = [
      {
        studentId: leader._id,
        name: leader.fullName,
        regNo: leader.regNo || "N/A",
        status: "approved",
      },
    ];

    if (applicationType === "group") {
      if (!members || members.length !== 2) {
        return res.status(400).json({
          message:
            "A group application must include exactly two other members.",
        });
      }

      for (const member of members) {
        const memberUser = await User.findOne({ regNo: member.regNo });
        if (!memberUser) {
          return res.status(404).json({
            message: `Student with Reg No "${member.regNo}" not found.`,
          });
        }

        const teammateAlreadyApplied = await StudentProjectApply.findOne({
          projectId,
          "members.studentId": memberUser._id,
        });
        if (teammateAlreadyApplied) {
          return res.status(400).json({
            message: `Student ${memberUser.fullName} has already applied for this project.`,
          });
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
      priority,
      status:
        applicationType === "group"
          ? "pending_member_approval"
          : "pending_faculty_approval",
    });

    await application.save();

    // 🚨 Only notify faculty if it's priority 1
    if (priority === 1) {
      console.log(
        `Faculty ${project.facultyName} notified about Priority 1 application`
      );
    }

    res.status(201).json({
      message: `Application for Priority ${priority} submitted successfully!`,
      application,
    });
  } catch (error) {
    console.error("Apply to project error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// NEW: Get all pending invitations for the logged-in student
export const getPendingInvitations = async (req, res) => {
  try {
    // Get the logged-in student's ID from the request object.
    const studentId = req.user._id;

    // Find project applications where a single element in the 'members' array
    // matches BOTH the student's ID and a 'pending' status.
    // $elemMatch is crucial here to ensure both conditions are met by the same member.
    const invitations = await StudentProjectApply.find({
      members: {
        $elemMatch: {
          studentId: studentId,
          status: "pending",
        },
      },
    }).populate("projectId", "projectTitle facultyName"); // Populate project details.

    // The rest of your logic for formatting the response is correct and remains the same.
    // It filters and maps the found applications to the format expected by the frontend.
    const formattedInvitations = invitations.map((app) => {
      // Find the specific member document for the current user.
      const member = app.members.find((m) => m.studentId.equals(studentId));
      // Assume the first member in the array is the leader.
      const leader = app.members[0];

      return {
        applicationId: app._id,
        memberId: member._id,
        projectTitle: app.projectId.projectTitle,
        facultyName: app.projectId.facultyName,
        leaderName: leader.name,
      };
    });

    // Send the correctly filtered and formatted invitations back to the client.
    res.status(200).json(formattedInvitations);
  } catch (error) {
    // Handle any server-side errors that occur during the process.
    console.error("Error fetching pending invitations:", error);
    res.status(500).json({
      message: "Server error fetching invitations.",
      error: error.message,
    });
  }
};

// NEW: Respond to an invitation (accept or reject)
export const respondToInvitation = async (req, res) => {
  try {
    const { applicationId, memberId, response } = req.body;
    const studentId = req.user._id;

    if (!["approved", "rejected"].includes(response)) {
      return res.status(400).json({ message: "Invalid response." });
    }

    const application = await StudentProjectApply.findById(applicationId);
    if (!application) {
      return res.status(404).json({ message: "Application not found." });
    }

    const member = application.members.id(memberId);
    if (!member || !member.studentId.equals(studentId)) {
      return res.status(403).json({
        message: "You are not authorized to respond to this invitation.",
      });
    }

    if (response === "approved") {
      member.status = "approved";

      const allMembersApproved = application.members.every(
        (m) => m.status === "approved"
      );
      if (allMembersApproved) {
        application.status = "pending_faculty_approval";
        // TODO: Notify the faculty member
        console.log(
          `NOTIFY FACULTY: Application ${application._id} is ready for review.`
        );
      }
    } else {
      // 'rejected'
      // If one member rejects, the entire application is removed.
      await StudentProjectApply.findByIdAndDelete(applicationId);
      // TODO: Notify the group leader that their application was rejected by a teammate.
      return res.status(200).json({
        message:
          "You have rejected the invitation. The application has been withdrawn.",
      });
    }

    await application.save();
    res
      .status(200)
      .json({ message: "You have successfully accepted the invitation!" });
  } catch (error) {
    res.status(500).json({
      message: "Server error responding to invitation.",
      error: error.message,
    });
  }
};

// export const getApplicationsForProject = async (req, res) => {
//   try {
//     if (req.user.role !== "teacher") {
//       return res.status(403).json({
//         message: "Access denied. Only teachers can view applications.",
//       });
//     }

//     const { projectId } = req.params;

//     const project = await Project.findById(projectId);
//     if (!project) {
//       return res.status(404).json({ message: "Project not found" });
//     }

//     if (project.facultyName !== req.user.fullName) {
//       return res.status(403).json({
//         message:
//           "Access denied. You can only view applications for your own projects.",
//       });
//     }

//     // 🔹 Fetch all applications for this project
//     let applications = await StudentProjectApply.find({ projectId }).populate(
//       "members.studentId",
//       "fullName email regNo"
//     );

//     if (!applications.length) {
//       return res.status(200).json({ project, applications: [] });
//     }

//     // 🔹 Step 1: project-level priority filter
//     const hasPriority1 = applications.some((app) => app.priority === 1);
//     applications = applications.filter((app) =>
//       hasPriority1 ? app.priority === 1 : app.priority === 2
//     );

//     // 🔹 Step 2: student-level filter (remove all priority:2 if same student has priority:1 anywhere)
//     const priority1Students = await StudentProjectApply.distinct(
//       "members.studentId",
//       { priority: 1 }
//     );

//     applications = applications.filter((app) => {
//       if (app.priority === 1) return true; // always keep priority 1
//       // drop priority 2 if student has priority 1 elsewhere
//       return !app.members.some((m) =>
//         priority1Students.includes(m.studentId.toString())
//       );
//     });

//     res.status(200).json({
//       project: {
//         _id: project._id,
//         title: project.projectTitle,
//         facultyName: project.facultyName,
//       },
//       applications,
//     });
//   } catch (error) {
//     console.error("Get Applications Error:", error);
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };

export const getApplicationsForProject = async (req, res) => {
  try {
    if (req.user.role !== "teacher") {
      return res.status(403).json({
        message: "Access denied. Only teachers can view applications.",
      });
    }

    const { projectId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (project.facultyName !== req.user.fullName) {
      return res.status(403).json({
        message:
          "Access denied. You can only view applications for your own projects.",
      });
    }

    // 🔹 Fetch all applications for this project
    let applications = await StudentProjectApply.find({ projectId }).populate(
      "members.studentId",
      "fullName email regNo"
    );

    if (!applications.length) {
      return res.status(200).json({ project, applications: [] });
    }

    // 🔹 Step 1: Determine highest priority present (only 1 or 2 allowed)
    let highestPriority = null;
    for (let p = 1; p <= 2; p++) {
      if (applications.some((app) => app.priority === p)) {
        highestPriority = p;
        break;
      }
    }

    if (!highestPriority) {
      // no priority 1 or 2 found → ignore priority 3+
      return res.status(200).json({ project, applications: [] });
    }

    applications = applications.filter(
      (app) => app.priority === highestPriority
    );

    // 🔹 Step 2: Global filter → drop ALL priority 2 apps of students who have priority 1 anywhere
    const priority1Students = await StudentProjectApply.distinct(
      "members.studentId",
      { priority: 1 }
    );
    const p1Set = new Set(priority1Students.map((id) => id.toString()));

    applications = applications.filter((app) => {
      if (app.priority === 2) {
        // keep only if none of its members have a priority 1 elsewhere
        return !app.members.some((m) => p1Set.has(m.studentId.toString()));
      }
      return true; // always keep priority 1 apps
    });

    res.status(200).json({
      project: {
        _id: project._id,
        title: project.projectTitle,
        facultyName: project.facultyName,
      },
      applications,
    });
  } catch (error) {
    console.error("Get Applications Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
