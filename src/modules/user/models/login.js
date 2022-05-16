import mongoose from "mongoose";

const loginDetailsSchema = new mongoose.Schema({
  user: {
    type: mongoose.Types.ObjectId,
    ref: "User",
  },

  devices: [
    {
      deviceInfo: Object,
      locationInfo: Object,
      lastActive: Date,
    },
  ],

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const LoginDetails = mongoose.model("LoginDetails", loginDetailsSchema);

export default LoginDetails;
