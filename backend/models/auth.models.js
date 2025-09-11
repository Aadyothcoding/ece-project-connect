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
    cgpa: {
      type: Number,
      required: false,
      min: 0,
      max: 10,
      default: null,
    },
    experience: {
      type: String,
      required: false,
    },
    branchSpecialisation: {
      type: String,
      enum: ["core", "ECE (CPS)", "ECE (DS)", "ECE (VLSI)", "ECE (EKE)", "ECE (MES)"],
      default: "core",
      required: function() { return this.role === "student"; },
      trim: true,
    },
    srmWebsite: {
      type: String,
      default: "",
      required: function() { return this.role === "teacher"; },
      trim: true,
    },
    researchPast: {
      type: String,
      required: false,
    },
    isVerified: {
      type: Boolean,
      default: true,
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
