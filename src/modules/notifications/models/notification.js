import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Types.ObjectId,
    ref: "Post",
  },

  user: {
    type: mongoose.Types.ObjectId,
    ref: "Post",
  },

  body: {
    type: String,
  },

  type: {
    type: String,
    enum: ["post", "story", "security", "follower"],
    default: "post",
  },

  thumbnail: {
    public_id: String,
    url: String,
  },

  isRead: {
    type: Boolean,
    default: false,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
