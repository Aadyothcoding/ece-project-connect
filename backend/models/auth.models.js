import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    // Add the new regNo field
    regNo: {
      type: String,
      unique: true,
      sparse: true, // Makes the unique index ignore documents where regNo is null
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["teacher", "student"],
      required: [true, "Role is required"],
    },
    department: {
      type: String,
      default: "",
      trim: true,
    },
    skills: {
      type: [String],
      default: [],
    },
    cgpa: {
      type: Number,
      required: false,
      min: 0,
      max: 10,
      default: null,
    },
    resumeUrl: {
      type: String,
      default: "",
    },
    profilePic: {
      type: String,
      default: "",
    },
    experience: {
      type: String,
      required: false,
    },
    description: {
      type: String,
      required: false,
    },
    researchPast: {
      type: String,
      required: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: String,
    tokenExpires: Date,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("User", userSchema);