// models/teamapproved.model.js
import mongoose from "mongoose";

const memberSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  name: { type: String, required: true },
  regNo: { type: String, required: true },
});

const teamApprovedSchema = new mongoose.Schema(
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
    approvedAt: {
      type: Date,
      default: Date.now,
    },
    facultyName: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("TeamApproved", teamApprovedSchema);
