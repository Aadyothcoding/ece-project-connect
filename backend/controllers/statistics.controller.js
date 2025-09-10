// controllers/statistics.controller.js
import User from "../models/auth.models.js";
import Project from "../models/projectupload.models.js";
import StudentProjectApply from "../models/studentprojectapply.models.js";
import TeamApproved from "../models/teamapproved.model.js";

// Only these emails can access statistics
const ALLOWED_EMAILS = [
  "sangeetm@srmist.edu.in",
  "vadivukk@srmist.edu.in",
  "elavelvg@srmist.edu.in"
];

export const getStatistics = async (req, res) => {
  try {
    const userEmail = req.user?.email;
    if (!ALLOWED_EMAILS.includes(userEmail)) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Teachers
    const teachers = await User.find({ role: "teacher" }).lean();
    const projects = await Project.find({}).lean();
    // Teachers with projects
    const teacherIdToProjects = {};
    projects.forEach(p => {
      if (!teacherIdToProjects[p.teacherId]) teacherIdToProjects[p.teacherId] = [];
      teacherIdToProjects[p.teacherId].push(p.projectTitle);
    });
    const teachersWithProjects = teachers.filter(t => teacherIdToProjects[t._id]);
    const teachersWithoutProjects = teachers.filter(t => !teacherIdToProjects[t._id]);

    // Students
    const students = await User.find({ role: "student" }).lean();
    const applications = await StudentProjectApply.find({}).lean();
    // Students who have applied
    const appliedStudentIds = new Set();
    applications.forEach(app => {
      app.members.forEach(m => appliedStudentIds.add(m.studentId.toString()));
    });
    const studentsWithApplications = students.filter(s => appliedStudentIds.has(s._id.toString()));
    const studentsWithoutApplications = students.filter(s => !appliedStudentIds.has(s._id.toString()));

    // Group applications with project and teacher info
    const groupApplications = await TeamApproved.find({ applicationType: "group" }).lean();
    const groupDetails = await Promise.all(groupApplications.map(async (group) => {
      const project = projects.find(p => p._id.toString() === group.projectId.toString());
      const teacher = teachers.find(t => t._id.toString() === project?.teacherId?.toString());
      return {
        projectTitle: project?.projectTitle || "Unknown",
        teacherName: teacher?.fullName || "Unknown",
        students: group.members.map(m => ({ name: m.name, regNo: m.regNo }))
      };
    }));

    // Simple counts for summary
    const teacherCount = teachers.length;
    const studentCount = students.length;
    const projectCount = projects.length;
    const applicationCount = applications.length;
    const groupCount = groupApplications.length;
    const individualCount = await TeamApproved.countDocuments({ applicationType: "individual" });

    res.json({
      teacherCount,
      studentCount,
      projectCount,
      applicationCount,
      groupCount,
      individualCount,
      teachersWithProjects: teachersWithProjects.map(t => ({
        name: t.fullName,
        email: t.email,
        projects: teacherIdToProjects[t._id] || []
      })),
      teachersWithoutProjects: teachersWithoutProjects.map(t => ({
        name: t.fullName,
        email: t.email
      })),
      studentsWithApplications: studentsWithApplications.map(s => ({
        name: s.fullName,
        email: s.email,
        regNo: s.regNo
      })),
      studentsWithoutApplications: studentsWithoutApplications.map(s => ({
        name: s.fullName,
        email: s.email,
        regNo: s.regNo
      })),
      groupDetails
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching statistics", error: err.message });
  }
};
