import mongoose from "mongoose";

const memberSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  name: { type: String, required: true },
  regNo: { type: String, required: true },
  status: {
    type: String,
    enum: ["pending", "approved"],
    default: "pending",
  },
  verificationToken: { type: String },
});

const studentProjectApplySchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    applicationType: {
      type: String,
      enum: ["individual", "group"],
      required: true,
    },
    // The leader is the first member in the array
    members: [memberSchema], 
    status: {
      type: String,
      enum: [
        "pending_member_approval",
        "pending_faculty_approval",
        "approved",
        "rejected",
      ],
      default: "pending_faculty_approval", // Default for individual
    },
    appliedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.model("StudentProjectApply", studentProjectApplySchema);