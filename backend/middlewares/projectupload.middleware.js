// projectupload.middleware.js
export const validateProjectData = (req, res, next) => {
  const {
    facultyName,
    projectTitle,
    description,
    applicationDeadline,
    stream,
    domain,
  } = req.body;

  if (
    !facultyName ||
    !projectTitle ||
    !description ||
    !applicationDeadline ||
    !stream ||
    !domain
  ) {
    return res.status(400).json({ message: "All fields are required" });
  }

  next();
};
