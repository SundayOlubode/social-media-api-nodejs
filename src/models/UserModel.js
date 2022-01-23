const mongoose = require("mongoose");
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");


const userSchema = new mongoose.Schema({

    name: {
        type: String,
        required: [true, "Please enter a name."]
    },

    email: {
        type: String,
        required: [true, "Please enter an email."],
        unique: [true, "Email already exists."]
    },

    avatar: {
        public_id: String,
        url: String
    },

    password: {
        type: String,
        required: [true, "Please enter a password."],
        minlength: [6, "password must be at least 6 characters."],
        select: false
    },

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
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    })
}

// Match Password
userSchema.methods.matchPassword = async function (userPassword) {
    return await bcrypt.compare(userPassword, this.password);
}

// Generate Password Reset Token
userSchema.methods.getResetPasswordToken = function () {

    // Generating Token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Hashing Token
    this.resetPasswordToken = crypto.createHash("sha256")
        .update(resetToken)
        .digest("hex");

    this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

    return resetToken;
}


module.exports = mongoose.model("User", userSchema);