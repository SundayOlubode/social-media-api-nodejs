import catchAsyncError from "../../../helpers/catchAsyncError.js";
import Notification from "../models/notification.js";

export const generateNotification = catchAsyncError(
  async (req, res, nex) => {}
);

export const getNotification = catchAsyncError(async (req, res, nex) => {
  const userId = req.query.userId;

  const notifications = await Notification.find({ user: userId });

  res.status(200).json({
    success: true,
    results: notifications,
  });
});
