// controllers/globalDeadline.controller.js
import GlobalDeadline from "../models/GlobalDeadline.js";

const allowedEmails = [
  "sangeetm@srmist.edu.in",
  "vadivukk@srmist.edu.in",
  "elavelvg@srmist.edu.in"
];

export const getGlobalDeadline = async (req, res) => {
  try {
    const deadlineDoc = await GlobalDeadline.findOne();
    if (!deadlineDoc) {
      return res.status(404).json({ message: "No global deadline set." });
    }
    res.status(200).json({ deadline: deadlineDoc.deadline });
  } catch (error) {
    res.status(500).json({ message: "Error fetching global deadline.", error: error.message });
  }
};

export const setGlobalDeadline = async (req, res) => {
  try {
    if (!allowedEmails.includes(req.user.email)) {
      return res.status(403).json({ message: "Not authorized." });
    }
    const { deadline } = req.body;
    if (!deadline) {
      return res.status(400).json({ message: "Deadline is required." });
    }
    let deadlineDoc = await GlobalDeadline.findOne();
    if (deadlineDoc) {
      deadlineDoc.deadline = deadline;
      await deadlineDoc.save();
    } else {
      deadlineDoc = await GlobalDeadline.create({ deadline });
    }
    res.status(200).json({ message: "Global deadline updated.", deadline: deadlineDoc.deadline });
  } catch (error) {
    res.status(500).json({ message: "Error setting global deadline.", error: error.message });
  }
};
