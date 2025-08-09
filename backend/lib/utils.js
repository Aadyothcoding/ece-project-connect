// lib/utils.js
import jwt from "jsonwebtoken";

export const generateToken = (userId, res) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET not set in environment variables");
  }

  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  res.cookie("jwt", token, {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    httpOnly: true,
    sameSite: "None",               // ✅ REQUIRED for cross-site cookies
    secure: process.env.NODE_ENV !== "development",
    path: "/",
  });

  return token;
};
