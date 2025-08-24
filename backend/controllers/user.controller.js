import User from "../models/auth.models.js";
import TeamApproved from "../models/teamapproved.model.js";

// 🔍 Search student by regNo and check if they are already in a team
export const searchStudentByRegNo = async (req, res) => {
  try {
    const { regNo } = req.query;

    if (!regNo) {
      return res.status(400).json({ message: "Register number is required" });
    }

    const student = await User.findOne({ regNo, role: "student" });
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Check if student is already in a team
    const alreadyInTeam = await TeamApproved.findOne({
      "members.studentId": student._id,
    });

    if (alreadyInTeam) {
      return res.status(400).json({
        message: "Student is already part of another approved team",
      });
    }

    res.status(200).json({ student });
  } catch (err) {
    console.error("Search student error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};