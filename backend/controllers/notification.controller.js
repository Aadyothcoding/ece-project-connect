// controllers/notification.controller.js
import Notification from "../models/notifications.model.js";

// Create a notification
export const createNotification = async (req, res) => {
  try {
    const { userId, title, message, type } = req.body;

    const notification = new Notification({
      userId,
      title,
      message,
      type: type || "info",
    });

    await notification.save();
    res.status(201).json({ success: true, notification });
  } catch (err) {
    console.error("Error creating notification:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to create notification" });
  }
};

// Get all notifications for a user
// controllers/notification.controller.js
export const getUserNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      userId: req.user._id,
    }).sort({ createdAt: -1 });
    res.json({ success: true, notifications });
  } catch (err) {
    console.error("Error fetching notifications:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch notifications" });
  }
};

// Mark as read and delete
export const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params; // ✅ correct param
    const deleted = await Notification.findByIdAndDelete(notificationId);
    if (!deleted) {
      return res
        .status(404)
        .json({ success: false, message: "Notification not found" });
    }
    res.json({ success: true, message: "Notification deleted" });
  } catch (err) {
    console.error("Error deleting notification:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to delete notification" });
  }
};
