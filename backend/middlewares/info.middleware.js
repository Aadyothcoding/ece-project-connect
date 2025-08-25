// Middleware to ensure only teacher or the student themselves can fetch info
export const authorizeInfoAccess = (req, res, next) => {
  const { user } = req; // assume user is set in req from auth middleware

  if (user.role === "teacher" || user._id.toString() === req.params.id) {
    return next();
  }
  return res
    .status(403)
    .json({ message: "Not authorized to view this profile" });
};
