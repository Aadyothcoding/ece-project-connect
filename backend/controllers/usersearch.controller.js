// controllers/usersearch.controller.js
import User from "../models/auth.models.js";
import StudentProjectApply from "../models/studentprojectapply.models.js";
import TeamApproved from "../models/teamapproved.model.js";

export const searchUsers = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res
        .status(400)
        .json({ message: "Query parameter 'q' is required" });
    }

    const unavailableStudentIds = new Set();

    // 🔹 Exclude students already in approved teams (only once allowed)
    const approvedTeams = await TeamApproved.find({}, "members.studentId");
    approvedTeams.forEach((team) => {
      team.members.forEach((m) =>
        unavailableStudentIds.add(m.studentId.toString())
      );
    });

    // 🔹 Count how many times each student appears in StudentProjectApply
    const applicationCounts = await StudentProjectApply.aggregate([
      {
        $match: {
          status: {
            $in: [
              "pending_member_approval",
              "pending_faculty_approval",
              "approved",
            ],
          },
        },
      },
      { $unwind: "$members" },
      {
        $group: {
          _id: "$members.studentId",
          count: { $sum: 1 },
        },
      },
      { $match: { count: { $gte: 2 } } }, // ❌ Exclude students in 2+ applications
    ]);

    applicationCounts.forEach((s) =>
      unavailableStudentIds.add(s._id.toString())
    );

    // 🔹 Now search only available students
    const users = await User.find(
      {
        role: "student",
        $or: [
          { fullName: { $regex: q, $options: "i" } },
          { regNo: { $regex: q, $options: "i" } },
        ],
        _id: { $nin: Array.from(unavailableStudentIds) },
      },
      { _id: 1, regNo: 1, fullName: 1, email: 1 }
    ).limit(10);

    res.json(users);
  } catch (err) {
    console.error("User search error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
