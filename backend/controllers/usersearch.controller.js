// controllers/usersearch.controller.js
import User from "../models/auth.models.js";

export const searchUsers = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res
        .status(400)
        .json({ message: "Query parameter 'q' is required" });
    }

    const users = await User.find(
      { regNo: { $regex: q, $options: "i" } },
      { _id: 1, regNo: 1, fullName: 1, email: 1 }
    ).limit(10);

    res.json(users);
  } catch (err) {
    console.error("User search error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
