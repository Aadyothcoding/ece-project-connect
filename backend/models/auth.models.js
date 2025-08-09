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
      type: [String], // e.g. ["JavaScript", "React", "Node.js"]
      default: [],
    },
    resumeUrl: {
      type: String, // stored file URL from cloud storage
      default: "",
    },
    profilePic: {
      type: String, // stored file URL from cloud storage
      default: "",
    },
    experience: {
    type: String,
    required: false,  // or true if mandatory
  },
  description: {
    type: String,
    required: false,
  },
  researchPast: {    // avoid spaces in key names; use camelCase or underscores
    type: String,
    required: false,
  },

    // Email verification fields
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: String,
    tokenExpires: Date,

    // Forgot/reset password fields
    resetPasswordToken: String,
    resetPasswordExpires: Date,
  },
  {
    timestamps: true,
  }
);

//experience , description , research past , previous projects, etc. can be added later as needed,

export default mongoose.model("User", userSchema);
