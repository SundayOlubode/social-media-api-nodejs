const catchAsyncError = require("../middlewares/catchAsyncError");
const User = require("../models/userModel");
const Post = require("../models/PostModel");
const ErrorHandler = require("../utils/errorHandler");


// Register User
exports.register = catchAsyncError(async (req, res, next) => {

    const { name, email, password } = req.body;

    let user = await User.findOne({ email });

    if (user) {
        return next(new ErrorHandler("User already exists with this email.", 400));
    }

    user = await User.create({
        name,
        email,
        password,
        avatar: {
            public_id: 'smaple_pub_id',
            url: 'sample_url'
        }
    });

    const token = user.generateToken();

    // Options for cookie
    const options = {
        expires: new Date(Date.now + process.env.COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
        httpOnly: true
    }

    res.status(201).cookie('token', token, options).json({
        success: true,
        message: "User registered.",
        token: token,
        user: user
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
        return next(new ErrorHandler("User does not exist.", 404));
    }

    const isPasswordMatched = await user.matchPassword(password);

    if (!isPasswordMatched) {
        return next(new ErrorHandler("Incorrect password.", 400));
    }

    const token = user.generateToken();

    // Options for cookie
    const options = {
        expires: new Date(Date.now + process.env.COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
        httpOnly: true
    }

    res.status(200).cookie('token', token, options).json({
        success: true,
        message: "User logged in.",
        token: token,
        user: user
    });

});


// Logout User
exports.logout = catchAsyncError(async (req, res, next) => {

    res.cookie('token', null, {
        expires: new Date(Date.now()),
        httpOnly: true
    });

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
        return next(new ErrorHandler("Both new passwords do not matched.", 400));
    }

    user.password = newPassword;

    await user.save();

    res.status(200).json({
        success: true,
        message: "Password updated."
    });

});


// Update User Profile
exports.updateUserProfile = catchAsyncError(async (req, res, next) => {

    const { name, email } = req.body;

    const user = await User.findById(req.user._id);

    if (name) {
        user.name = name;
    }

    if (email) {
        user.email = email;
    }

    await user.save();

    // if (req.body.avatar !== "") {
    //     const user = await User.findById(req.user.id);

    //     const imageId = user.avatar.public_id;

    //     await cloudinary.v2.uploader.destroy(imageId);

    //     const cloudUpload = await cloudinary.v2.uploader
    //         .upload(req.body.avatar, {
    //             folder: 'avatars',
    //             width: 150,
    //             crop: 'scale'
    //         });

    //     newUserDetails.avatar = {
    //         public_id: cloudUpload.public_id,
    //         url: cloudUpload.secure_url
    //     }

    // }


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


// Get All Users
exports.getAllUsers = catchAsyncError(async (req, res, next) => {

    const users = await User.find();

    res.status(200).json({
        success: true,
        count: users.length,
        results: users
    });

});