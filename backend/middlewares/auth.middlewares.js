// auth/middlewares/auth.middlewares.js
import jwt from "jsonwebtoken";
// ✅ CHANGED: Corrected the model import path from 'models.js' to 'model.js'
import User from "../models/auth.models.js";

export const protectRoute = async (req, res, next) => {
  try {
    console.log("🛡️ [protectRoute middleware triggered]");
    console.log("🍪 Cookies received:", req.cookies);

    const token = req.cookies.jwt;
    if (!token) {
      console.warn("❌ No token found in cookies");
      return res.status(401).json({ message: "Unauthorized - No Token Provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded?.userId) {
      console.warn("❌ Token decoded but no userId found");
      return res.status(401).json({ message: "Unauthorized - Invalid Token" });
    }

    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      console.warn("❌ User not found for decoded token");
      return res.status(404).json({ message: "User not found" });
    }

    req.user = user;
    console.log("✅ Authenticated user:", user.fullName || user.email);
    next();
  } catch (error) {
    console.error("❌ Error in protectRoute middleware:", error.message);

    // ✅ ADDED: Specific error handling for JWT issues
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: "Unauthorized - Your session is invalid or has expired." });
    }

    // Fallback for other unexpected errors
    return res.status(500).json({ message: "Internal server error" });
  }
};