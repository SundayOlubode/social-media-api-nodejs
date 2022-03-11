const mongoose = require("mongoose");
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const crypto = require("crypto");


const userSchema = new mongoose.Schema({
    fname: {
        type: String,
        minlength: [3, "First name must be at least 3 characters."],
        required: [true, "Please enter a first name."]
    },

    lname: {
        type: String,
        required: [true, "Please enter a last name."]
    },

    email: {
        type: String,
        required: [true, "Please enter an email."],
        unique: [true, "Email already exists."],
    },

    uname: {
        type: String,
        required: [true, "Please enter an username."],
        unique: [true, "Username not available."],
        minlength: [3, "Username must be at least 3 characters."],
        maxlength: [20, "Username must not exceeds 20 characters."],
    },

    phone: {
        countryCode: String,
        phoneNo: Number
    },

    password: {
        type: String,
        required: [true, "Please enter a password."],
        minlength: [6, "password must be at least 6 characters."],
        select: false
    },

    avatar: {
        public_id: String,
        url: String
    },

    gender: String,

    dob: String,

    about: String,

    posts: [
        {
            type: mongoose.Types.ObjectId,
            ref: "Post"
        }
    ],

    followers: [
        {
            type: mongoose.Types.ObjectId,
            ref: "User"
        }
    ],

    following: [
        {
            type: mongoose.Types.ObjectId,
            ref: "User"
        }
    ],

    role: {
        type: String,
        default: "user"
    },

    accountStatus: {
        type: String,
        default: "active"
    },

    is_verified: {
        type: Boolean,
        default: false
    },

    createdAt: {
        type: Date,
        default: Date.now
    },

    token: String,
    expiresAt: String,

    resetPasswordToken: String,
    resetPasswordExpire: Date
});


// Hash Password
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        next();
    }

    this.password = await bcrypt.hash(this.password, 16);
});

// JWT Token
userSchema.methods.generateToken = function () {
    const token = jwt.sign({ id: this._id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    const decodedData = jwt.decode(token);
    this.token = token;
    this.expiresAt = decodedData.exp;

    return token;
}

// Match Password
userSchema.methods.matchPassword = async function (userPassword) {
    return await bcrypt.compare(userPassword, this.password);
}

// Generate Password Reset Token
userSchema.methods.generatePasswordResetToken = function () {

    // Generating Token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Hashing Token
    this.resetPasswordToken = crypto.createHash("sha256")
        .update(resetToken)
        .digest("hex");

    this.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // Valid for 15 minutes

    return resetToken;
}


userSchema.index({ uname: true })
module.exports = mongoose.model("User", userSchema);