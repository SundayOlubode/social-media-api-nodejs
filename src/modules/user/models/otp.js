const mongoose = require("mongoose");


const otpSchema = new mongoose.Schema({
    otp: String,

    expiresAt: Date,

    isVerified: {
        type: Boolean,
        default: false
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
});


module.exports = mongoose.model("OTP", otpSchema);