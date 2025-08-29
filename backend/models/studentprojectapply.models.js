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
    members: [memberSchema],
    status: {
      type: String,
      enum: [
        "pending_member_approval",
        "pending_faculty_approval",
        "approved",
        "rejected",
      ],
      default: "pending_faculty_approval",
    },
    priority: {
      type: Number,
      enum: [1, 2],
      required: true,
    },
    appliedAt: {
      type: Date,
      default: () => new Date(),
      expires: 60 * 60 * 24 * 2, // 2 days TTL
    },
  },
  { timestamps: true }
);

export default mongoose.model("StudentProjectApply", studentProjectApplySchema);
