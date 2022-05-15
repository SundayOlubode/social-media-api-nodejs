import catchAsyncError from "../../../helpers/catchAsyncError.js";
import Notification from "../models/notification.js";

export const getNotification = catchAsyncError(async (req, res, nex) => {
  const userId = req.user._id;

  const notifications = await Notification.find({ owner: userId })
    .populate([
      {
        path: "owner",
        model: "User",
        select: [
          "_id",
          "fname",
          "lname",
          "email",
          "uname",
          "avatar",
          "profession",
          "accountType",
          "accountStatus",
          "isVerified",
        ],
      },
      {
        path: "user",
        model: "User",
        select: [
          "_id",
          "fname",
          "lname",
          "email",
          "uname",
          "avatar",
          "profession",
          "accountType",
          "accountStatus",
          "isVerified",
        ],
      },
    ])
    .sort({ createdAt: -1 })
    .limit(50);

  res.status(200).json({
    success: true,
    count: notifications.length,
    results: notifications,
  });
});
