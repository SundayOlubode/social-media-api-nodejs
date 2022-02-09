const catchAsyncError = require("../middlewares/catchAsyncError");
const User = require("../models/UserModel");
const Post = require("../models/PostModel");
const ErrorHandler = require("../utils/errorHandler");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");
const cloudinary = require("cloudinary");
const jwt = require("jsonwebtoken");


// Register User
exports.register = catchAsyncError(async (req, res, next) => {

    const { fname, lname, email, password, confirmPassword } = req.body;

    if (
        !fname || !lname || !email ||
        !password || !confirmPassword
    ) {
        return next(new ErrorHandler("Please enter required details.", 400));
    }

    if (password !== confirmPassword) {
        return next(new ErrorHandler("Both passwords do not matched.", 400));
    }

    let user = await User.findOne({ email });

    if (user) {
        return next(new ErrorHandler("User already exists with this email.", 400));
    }

    user = await User.create({
        fname,
        lname,
        email,
        password
    });

    const token = user.generateToken();
    await user.save();
    const decodedData = jwt.verify(token, process.env.JWT_SECRET);
    const expiresAt = decodedData.exp;

    const message = `Hello ${user.fname},
    \nWe're glad you're here! Welcome to NixLab Technologies.
    \n\nThank you for joining with us.
    \n\nThank You,\nNixLab Technologies Team`;

    try {
        await sendEmail({
            email: user.email,
            subject: `Welcome to NixLab Technologies`,
            message: message
        });
    } catch (err) {
        console.log(err.message);
    }

    res.status(201).json({
        success: true,
        message: "User registered.",
        token: token,
        expiresAt: expiresAt
    });

});


// Login User
exports.login = catchAsyncError(async (req, res, next) => {

    const { email, password } = req.body;

    // Email and Password validation
    if (!email || !password) {
        return next(new ErrorHandler("Please enter email and password to login.", 401));
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
        return next(new ErrorHandler("User not found.", 404));
    }

    const isPasswordMatched = await user.matchPassword(password);

    if (!isPasswordMatched) {
        return next(new ErrorHandler("Incorrect password.", 400));
    }

    let token = user.token;
    let expiresAt;

    if (token) {
        let decodedData;

        decodedData = jwt.verify(token, process.env.JWT_SECRET);
        expiresAt = decodedData.exp;

        if (decodedData.exp < new Date().getTime() / 1000) {
            token = user.generateToken();
            await user.save();
            decodedData = jwt.verify(token, process.env.JWT_SECRET);
            expiresAt = decodedData.exp;
        }
    }
    else {
        token = user.generateToken();
        await user.save();
        decodedData = jwt.verify(token, process.env.JWT_SECRET);
        expiresAt = decodedData.exp;
    }

    res.status(200)
        .json({
            success: true,
            message: "User logged in.",
            token: token,
            expiresAt: expiresAt
        });

});


// Logout User
exports.logout = catchAsyncError(async (req, res, next) => {

    res.status(200).json({
        success: true,
        message: "User logged out."
    });

});


// Get Profile Details
exports.getProfileDetails = catchAsyncError(async (req, res, next) => {

    const user = await User.findById(req.user._id).populate("posts");

    res.status(200).json({
        success: true,
        user
    });

})


// Follow User
exports.followUser = catchAsyncError(async (req, res, next) => {

    const userToFollow = await User.findById(req.params.id);
    const user = await User.findById(req.user._id);

    if (!userToFollow) {
        return next(new ErrorHandler("User not found.", 404));
    }

    if (user.following.includes(userToFollow._id)) {

        const indexFollowing = user.following.indexOf(userToFollow._id);
        user.following.splice(indexFollowing, 1);

        const indexFollower = userToFollow.followers.indexOf(user._id);
        userToFollow.followers.splice(indexFollower, 1);

        await user.save();
        await userToFollow.save();

        res.status(200).json({
            success: true,
            message: "User unfollowed."
        });

    }
    else {

        user.following.push(userToFollow._id);
        userToFollow.followers.push(user._id);

        await user.save();
        await userToFollow.save();

        res.status(200).json({
            success: true,
            message: "User followed."
        });

    }

});


// Update Password
exports.updatePassword = catchAsyncError(async (req, res, next) => {

    const { oldPassword, newPassword, confirmPassword } = req.body;

    if (!oldPassword || !newPassword || !confirmPassword) {
        return next(new ErrorHandler("Please provide old password, new password and confirm password.", 400));
    }

    const user = await User.findById(req.user._id).select("+password");

    const isPasswordMatched = await user.matchPassword(oldPassword);

    if (!isPasswordMatched) {
        return next(new ErrorHandler("Old password is incorrect.", 400));
    }

    if (newPassword !== confirmPassword) {
        return next(new ErrorHandler("New passwords do not matched.", 400));
    }

    user.password = newPassword;

    await user.save();

    res.status(200).json({
        success: true,
        message: "Password updated."
    });

});


// Forgot Password
exports.forgotPassword = catchAsyncError(async (req, res, next) => {

    const { email } = req.body;

    if (!email) {
        return next(new ErrorHandler("Please enter your email associated with account.", 400));
    }

    const user = await User.findOne({ email: email });

    if (!user) {
        return next(new ErrorHandler("User not found.", 404));
    }

    const resetToken = user.generatePasswordResetToken();

    await user.save();

    const resetPasswordUrl = `${req.protocol}://${req.get("host")}/api/v1/reset/password/${resetToken}`;

    const message = `Hello ${user.fname},
    \nYour password reset link is :- \n ${resetPasswordUrl}
    \nThis link is valid for only 15 minutes.
    \nIf you have not requested this email then, please ignore it.
    \n\nThank You,\nNixLab Technologies Team`;

    try {

        await sendEmail({
            email: user.email,
            subject: `Account Password Recovery`,
            message: message
        });

        res.status(200).json({
            success: true,
            message: `Email sent to ${user.email}.`
        });

    } catch (err) {

        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        return next(new ErrorHandler(err.message, 500));

    }

});


// Reset Password
exports.resetPassword = catchAsyncError(async (req, res, next) => {

    const { newPassword, confirmPassword } = req.body;

    if (!newPassword || !confirmPassword) {
        return next(new ErrorHandler("Please enter new password and confirm password.", 400));
    }

    const token = req.params.token;

    const resetPasswordToken = crypto.createHash("sha256")
        .update(token).digest("hex");

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
        return next(new ErrorHandler("Token is invalid or expired.", 401));
    }

    if (newPassword !== confirmPassword) {
        return next(new ErrorHandler("Passwords do not matched.", 400));
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(200).json({
        success: true,
        message: "Password changed."
    });

});


// Upload User Avatar
exports.uploadAvatar = catchAsyncError(async (req, res, next) => {

    const { avatar } = req.body;

    if (!avatar) {
        return next(new ErrorHandler("Please provide avatar image.", 400));
    }

    const user = await User.findById(req.user._id);

    if (user.avatar) {

        const imageId = user.avatar.public_id;

        await cloudinary.v2.uploader.destroy(imageId);

    }

    const cloudUpload = await cloudinary.v2.uploader
        .upload(avatar, {
            folder: "nixlab/avatars"
        });

    user.avatar = {
        public_id: cloudUpload.public_id,
        url: cloudUpload.secure_url
    }

    await user.save();

    res.status(200).json({
        success: true,
        message: "User avatar updated."
    });


});


// Update User Profile
exports.updateUserProfile = catchAsyncError(async (req, res, next) => {

    const { fname, lname } = req.body;

    const user = await User.findById(req.user._id);

    if (fname) {
        user.fname = fname;
    }

    if (lname) {
        user.lname = lname;
    }

    await user.save();


    res.status(200).json({
        success: true,
        message: "User profile updated.",
        user
    });

});


// Delete User Profile
exports.deleteProfile = catchAsyncError(async (req, res, next) => {

    const user = await User.findById(req.user._id);

    const posts = user.posts;
    const followers = user.followers;
    const followings = user.following;
    const userId = user._id;

    await user.remove();

    res.cookie('token', null, {
        expires: new Date(Date.now()),
        httpOnly: true
    });

    for (let i = 0; i < posts.length; i++) {
        const post = await Post.findById(posts[i]);
        post.remove();
    }

    for (let i = 0; i < followers.length; i++) {
        const follower = await User.findById(followers[i]);

        const index = follower.following.indexOf(userId);

        follower.following.splice(index, 1);

        await follower.save();
    }

    for (let i = 0; i < followings.length; i++) {
        const following = await User.findById(followings[i]);

        const index = following.followers.indexOf(userId);

        following.followers.splice(index, 1);

        await following.save();
    }

    res.status(200).json({
        success: true,
        message: "User profile deleted."
    });

});


// Get User Details
exports.getUserProfileDetails = catchAsyncError(async (req, res, next) => {

    const user = await User.findById(req.params.id).populate("posts");

    if (!user) {
        return next(new ErrorHandler("User not found.", 404));
    }

    res.status(200).json({
        success: true,
        user
    });

});


// Get All Users -- Admin
exports.getAllUsers = catchAsyncError(async (req, res, next) => {

    const users = await User.find();

    res.status(200).json({
        success: true,
        count: users.length,
        results: users
    });

});


// Update User Role -- Admin
exports.updateUserRole = catchAsyncError(async (req, res, next) => {

    const { role } = req.body;

    if (!role) {
        return next(new ErrorHandler("Please enter a role.", 400));
    }

    const user = User.findById(req.params.id);

    if (!user) {
        return next(new ErrorHandler("User not found.", 404));
    }

    user.role = String(role).toLowerCase();

    await user.save();

    res.status(200).json({
        success: true,
        message: "User role updated."
    });

});


// Delete User -- Admin
exports.deleteUser = catchAsyncError(async (req, res, next) => {

    const user = await User.findById(req.params.id);

    if (!user) {
        return next(new ErrorHandler("User not found.", 404));
    }

    const imageId = user.avatar.public_id;

    await cloudinary.v2.uploader.destroy(imageId);

    await user.remove();

    res.status(200).json({
        success: true,
        message: "User deleted."
    });

})