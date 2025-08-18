// middlewares/teamapproved.middleware.js
import StudentProjectApply from "../models/studentprojectapply.models.js";

export const validateApplicationExists = async (req, res, next) => {
  try {
    const { applicationId } = req.params;
    const application = await StudentProjectApply.findById(applicationId);
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }
    req.application = application; // attach to request for controller use
    next();
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
