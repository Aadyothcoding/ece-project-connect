export const getTeacherInfo = async (req, res) => {
  try {
    const { id } = req.params; // teacher _id
    const teacher = await User.findById(id).select(
      "fullName email department experience researchPast srmWebsite"
    );

    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    res.json(teacher);
  } catch (error) {
    console.error("Error fetching teacher info:", error);
    res.status(500).json({ message: "Server error" });
  }
};
import User from "../models/auth.models.js";

export const getStudentInfo = async (req, res) => {
  try {
    const { id } = req.params; // student _id
    const student = await User.findById(id).select(
      "fullName email regNo department skills resumeUrl experience description researchPast cgpa"
    );

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json(student);
  } catch (error) {
    console.error("Error fetching student info:", error);
    res.status(500).json({ message: "Server error" });
  }
};
