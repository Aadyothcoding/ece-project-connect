// models/projectupload.model.js
import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    // ADD THIS FIELD
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // This links to your User model
      required: true,
    },
    facultyName: {
      type: String,
      required: [true, "Faculty name is required"],
      trim: true,
    },
    projectTitle: {
      type: String,
      required: [true, "Project title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Project description is required"],
      trim: true,
    },
  // applicationDeadline removed, now handled globally
    domain: {
      type: String,
      required: [true, "Domain is required"],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Project", projectSchema);
