import crypto from "crypto";
import StudentProjectApply from "../models/studentprojectapply.models.js";
import Project from "../models/projectupload.models.js";
import User from "../models/auth.models.js";

// This is a placeholder for a real email service like Nodemailer or SendGrid.
// For now, it will log the verification details to your backend console.
const sendMemberVerificationEmail = (email, name, verificationLink) => {
  console.log(`
    =================================================
    SENDING VERIFICATION EMAIL to ${email} (${name})
    -------------------------------------------------
    Subject: Project Application: Please Verify Your Participation
    
    Hi ${name},
    
    You have been added as a teammate for a project application.
    Please click the link below to confirm you are part of this group:
    ${verificationLink}
    
    If you did not expect this, you can safely ignore this email.
    =================================================
  `);
  // In a production app, you would use a mailer library here.
  // Example: await mailer.send({ to: email, subject: '...', html: '...' });
};


export const applyToProject = async (req, res) => {
  try {
    const { projectId, applicationType, members } = req.body;
    // The leader is the logged-in user who is submitting the form.
    const leader = req.user; 

    // --- Basic Validations ---
    if (!["individual", "group"].includes(applicationType)) {
      return res.status(400).json({ message: "Invalid application type." });
    }
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found." });
    }

    // --- Create Member List ---
    const memberList = [];
    
    // Add the leader to the list. They are automatically approved.
    memberList.push({
      studentId: leader._id,
      name: leader.fullName,
      regNo: "leaderRegNo", // NOTE: Add 'regNo' to your User model for this to be dynamic
      status: "approved", 
    });

    if (applicationType === "group") {
      if (!members || members.length !== 2) {
        return res.status(400).json({ message: "A group application must include exactly two other members." });
      }
      // Find and add other members
      for (const member of members) {
        // In a real-world scenario, you would find the user by their unique registration number.
        // Here, we simulate finding them by name for demonstration.
        const memberUser = await User.findOne({ fullName: member.name }); 
        if (!memberUser) {
          return res.status(404).json({ message: `Student "${member.name}" could not be found.` });
        }
        memberList.push({
          studentId: memberUser._id,
          name: member.name,
          regNo: member.regNo,
          status: "pending",
          verificationToken: crypto.randomBytes(32).toString("hex"),
        });
      }
    }

    // --- Create the Application Document ---
    const application = new StudentProjectApply({
      projectId,
      applicationType,
      members: memberList,
      // Set initial status based on application type
      status: applicationType === 'group' ? 'pending_member_approval' : 'pending_faculty_approval',
    });

    await application.save();

    // --- Send Verification Emails for Group Members ---
    if (applicationType === "group") {
      const membersToNotify = application.members.slice(1); // Exclude the leader
      for (const member of membersToNotify) {
        const memberUser = await User.findById(member.studentId);
        // Construct the unique verification link for each member
        const verificationLink = `http://localhost:5173/verify-application/${application._id}/${member._id}/${member.verificationToken}`;
        sendMemberVerificationEmail(memberUser.email, member.name, verificationLink);
      }
    }

    res.status(201).json({ 
        message: applicationType === 'group' 
            ? "Group application initiated! Your teammates must verify via the link sent to their email." 
            : "Application submitted successfully!",
        application 
    });

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const verifyGroupApplication = async (req, res) => {
    try {
        const { applicationId, memberId, token } = req.params;

        const application = await StudentProjectApply.findById(applicationId);
        if (!application) {
            return res.status(404).json({ message: "Application not found. It may have been withdrawn." });
        }

        const member = application.members.id(memberId);
        if (!member || member.verificationToken !== token) {
            return res.status(400).json({ message: "This verification link is invalid or has expired." });
        }

        member.status = "approved";
        member.verificationToken = undefined; // The token is single-use

        // After approval, check if all members have now verified.
        const allMembersApproved = application.members.every(m => m.status === 'approved');
        if (allMembersApproved) {
            application.status = 'pending_faculty_approval';
            // Conceptually, you would trigger a notification to the faculty here.
            console.log(`
                NOTIFY FACULTY: Application ${application._id} for project ${application.projectId} is fully approved by all members and is now ready for your review.
            `);
        }

        await application.save();

        res.status(200).json({ message: "Verification successful! Thank you for confirming your participation." });

    } catch (error) {
        res.status(500).json({ message: "Server error during verification.", error: error.message });
    }
};

export const getApplicationsForProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Populate the student details within the members array
    const applications = await StudentProjectApply.find({ projectId }).populate(
      "members.studentId",
      "fullName email"
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