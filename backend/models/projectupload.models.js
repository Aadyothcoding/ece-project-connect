import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
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
    datePosted: {
      type: Date,
      default: Date.now, // Auto-set to current date
    },
    applicationDeadline: {
      type: Date,
      required: [true, "Application deadline is required"],
    },
    stream: {
      type: String,
      required: [true, "Stream is required"], // e.g., CSE, ECE, Mechanical
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Project", projectSchema);
