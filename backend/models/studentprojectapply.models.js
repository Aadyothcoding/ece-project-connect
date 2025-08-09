import mongoose from "mongoose";

const studentProjectApplySchema = new mongoose.Schema(
  {
    studentName: {
      type: String,
      required: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student", // Assuming you have a Student model
      required: true,
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    appliedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.model("StudentProjectApply", studentProjectApplySchema);
