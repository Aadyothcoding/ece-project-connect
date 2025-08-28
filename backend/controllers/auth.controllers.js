import { generateToken } from "../lib/utils.js";
import User from "../models/auth.models.js";
import bcrypt from "bcryptjs";
import { sendWelcomeEmail, sendVerificationEmail, sendResetEmail } from "../lib/mailer.js";
import crypto from "crypto";

export const signup = async (req, res) => {
  // Add 'regNo' to the destructuring
  const { fullName, email, password, role, regNo, experience, description, researchPast } = req.body;

  try {
    if (!fullName || !email || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (!["teacher", "student"].includes(role.toLowerCase())) {
      return res.status(400).json({ message: "Invalid role" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }
    // Add validation for regNo if the user is a student
    if (role.toLowerCase() === 'student' && !regNo) {
        return res.status(400).json({ message: "Registration number is required for students." });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }
    
    // Check if regNo is already in use
    if (role.toLowerCase() === 'student') {
        const existingRegNo = await User.findOne({ regNo });
        if (existingRegNo) {
            return res.status(400).json({ message: "Registration number already exists." });
        }
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");
    const tokenExpires = Date.now() + 24 * 60 * 60 * 1000;

    const newUser = await User.create({
      fullName,
      email,
      regNo: role.toLowerCase() === 'student' ? regNo : undefined, // Only save regNo for students
      password: hashedPassword,
      role: role.toLowerCase(),
      experience,
      description,
      researchPast,
      verificationToken: hashedToken,
      tokenExpires,
    });

    try {
      //await sendVerificationEmail(email, fullName, rawToken);
      //await sendWelcomeEmail(email, fullName);

      res.status(201).json({
        _id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        role: newUser.role,
        message: "Account created. Please check your email to verify your account."
      });
    } catch (emailError) {
      console.error("📧 Email sending failed after user creation:", emailError.message);
      res.status(201).json({
        message: "Account created, but failed to send verification email. Please try resending.",
        user: {
          _id: newUser._id,
          fullName: newUser.fullName,
          email: newUser.email,
          role: newUser.role,
        },
      });
    }
  } catch (error) {
    console.error("Error in signup controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ message: "Email is required" });
  
  try {
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(200).json({ message: "If a user with that email exists, a reset link has been sent." });
    }
    
    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");
    
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save();
    
    await sendResetEmail(user.email, user.fullName, rawToken);
    res.status(200).json({ message: "If a user with that email exists, a reset link has been sent." });

  } catch (err) {
    console.error("❌ Error in forgotPassword controller:", err.message);
    res.status(500).json({ message: "An error occurred while trying to send the reset email. Please try again later." });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Invalid credentials" });

    if (!user.isVerified) {
      return res.status(401).json({ message: "Please verify your email before logging in" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect)
      return res.status(400).json({ message: "Invalid credentials" });

    generateToken(user._id, res);

    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      profilePic: user.profilePic || null,
    });

  } catch (error) {
    console.error("Error in login controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Error in logout controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
  const { 
    profilePic, 
    department, 
    skills, 
    resumeUrl, 
    experience, 
    description, 
    researchPast, 
    cgpa
  } = req.body;
    
    const userId = req.user._id;

    const updatedFields = {};
  if (profilePic) updatedFields.profilePic = profilePic;
  if (department) updatedFields.department = department;
  if (skills) updatedFields.skills = skills;
  if (resumeUrl) updatedFields.resumeUrl = resumeUrl;
  if (cgpa !== undefined) updatedFields.cgpa = cgpa;
    
    if (req.user.role === 'teacher') {
        if (experience) updatedFields.experience = experience;
        if (description) updatedFields.description = description;
        if (researchPast) updatedFields.researchPast = researchPast;
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updatedFields },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error in updateProfile:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const checkAuth = (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    console.error("Error in checkAuth:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const verifyEmail = async (req, res) => {
  const { token } = req.query;
  if (!token) return res.status(400).json({ message: "Token is missing." });

  try {
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      verificationToken: hashedToken,
      tokenExpires: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ message: "Invalid or expired token." });

    user.isVerified = true;
    user.verificationToken = undefined;
    user.tokenExpires = undefined;

    await user.save();

    res.status(200).json({ message: "Email verified successfully! You can now log in." });
  } catch (err) {
    console.error("Verification error:", err.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const resetPassword = async (req, res) => {
  const { token, password } = req.body;

  if (!token || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json({ message: "Invalid or expired token" });
  }

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(password, salt);

  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;

  await user.save();

  res.status(200).json({ message: "Password reset successful!" });
};
