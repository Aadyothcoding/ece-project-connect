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

    // Find all studentIds who are in a pending or approved application
    const pendingApps = await StudentProjectApply.find({
      status: {
        $in: [
          "pending_member_approval",
          "pending_faculty_approval",
          "approved",
        ],
      },
    });
    const approvedTeams = await TeamApproved.find();
    const unavailableIds = new Set();
    pendingApps.forEach((app) =>
      app.members.forEach((m) => unavailableIds.add(m.studentId.toString()))
    );
    approvedTeams.forEach((team) =>
      team.members.forEach((m) => unavailableIds.add(m.studentId.toString()))
    );

    // Search students not in unavailableIds
    const users = await User.find(
      {
        role: "student",
        $or: [
          { fullName: { $regex: q, $options: "i" } },
          { regNo: { $regex: q, $options: "i" } },
        ],
        _id: { $nin: Array.from(unavailableIds) },
      },
      { _id: 1, regNo: 1, fullName: 1, email: 1 }
    ).limit(10);

    res.json(users);
  } catch (err) {
    console.error("User search error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
