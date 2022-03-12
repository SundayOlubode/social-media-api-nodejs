const cloudinary = require("cloudinary");
const jwt = require("jsonwebtoken");
const catchAsyncError = require("../../../helpers/catchAsyncError");
const ErrorHandler = require("../../../helpers/errorHandler");
const sendEmail = require("../../../helpers/sendEmail");
const User = require("../models/user");
const Post = require("../../post/models/post");
const OTP = require("../models/otp");
const generateOTP = require('./generateOTP');
const { validateEmail, validateUsername } = require("../../../utils/validators");
const dates = require('./dateFunc');


// Check Username Availability
const checkUsernameAvailable = async (uname) => {
    let user = await User.findOne({ uname });

    if (user) {
        return false;
    }

    return true;
}


// Delete All expired OTPs
exports.deleteExpiredOTPs = async () => {
    const otps = await OTP.find();

    for (let i = 0; i < otps.length; i++) {
        if (dates.compare(otps[i].expiresAt, new Date()) === -1) {
            await otps[i].remove();
        }
    }

    console.log("[cron] task has deleted expired OTPs.")
}


// Register User
exports.register = catchAsyncError(async (req, res, next) => {

    const { fname, lname, email, uname, password, confirmPassword } = req.body;

    // Input Validation
    if (!fname) {
        return next(new ErrorHandler("Please enter your first name.", 400));
    }

    if (String(fname).length < 3) {
        return next(new ErrorHandler("First name must be at least 3 characters.", 400));
    }

    if (!lname) {
        return next(new ErrorHandler("Please enter your last name.", 400));
    }

    if (!email) {
        return next(new ErrorHandler("Please enter your email.", 400));
    }

    if (email && !validateEmail(email)) {
        return next(new ErrorHandler("Please enter a valid email address.", 400));
    }

    if (!uname) {
        return next(new ErrorHandler("Please enter an username.", 400));
    }

    if (String(uname).length < 3) {
        return next(new ErrorHandler("Username must be at least 3 characters.", 400));
    }

    if (String(uname).length > 20) {
        return next(new ErrorHandler("Username must not exceeds 20 characters", 400));
    }

    if (uname && !validateUsername(uname)) {
        return next(new ErrorHandler("Please enter a valid username.", 400));
    }

    if (uname) {
        const isUsernameAvailable = await checkUsernameAvailable(uname);

        if (!isUsernameAvailable) {
            return next(new ErrorHandler("Username not available.", 400));
        }
    }

    if (!password) {
        return next(new ErrorHandler("Please enter a password.", 400));
    }

    if (!confirmPassword) {
        return next(new ErrorHandler("Please enter the password again.", 400));
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
        uname,
        password
    });

    const token = await user.generateToken();
    await user.save();
    const decodedData = jwt.decode(token);
    const expiresAt = decodedData.exp;

    const htmlMessage = `<p>Hello ${user.fname},</p>
    <h2>Welcome to NixLab Technologies.</h2>
    <p>We're glad you're here!</p>
    <p>This is a auto-generated email. Please do not reply to this email.</p>
    <p>Regards, <br>
    NixLab Technologies Team</p>`

    try {
        await sendEmail({
            email: user.email,
            subject: `Welcome to NixLab Technologies`,
            htmlMessage: htmlMessage
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

    if (!email) {
        return next(new ErrorHandler("Please enter your email.", 400));
    }

    if (email && !validateEmail(email)) {
        return next(new ErrorHandler("Please enter a valid email address.", 400));
    }

    if (!password) {
        return next(new ErrorHandler("Please enter your password.", 400));
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
    let expiresAt = user.expiresAt;

    if (token && expiresAt) {
        if (expiresAt < new Date().getTime() / 1000) {
            token = await user.generateToken();
            await user.save();
            const decodedData = jwt.verify(token, process.env.JWT_SECRET);
            expiresAt = decodedData.exp;
        }
    }
    else {
        token = await user.generateToken();
        await user.save();
        const decodedData = jwt.verify(token, process.env.JWT_SECRET);
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

    const user = await User.findById(req.user._id);

    if (!userToFollow) {
        return next(new ErrorHandler("User not found.", 404));
    }

    user.token = undefined;
    user.expiresAt = undefined;

    await user.save();

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

    if (!oldPassword) {
        return next(new ErrorHandler("Please enter old password.", 400));
    }

    if (!newPassword) {
        return next(new ErrorHandler("Please enter new password.", 400));
    }

    if (!confirmPassword) {
        return next(new ErrorHandler("Please enter confirm password.", 400));
    }

    if (!isPasswordMatched) {
        return next(new ErrorHandler("Old password is incorrect.", 400));
    }

    if (newPassword !== confirmPassword) {
        return next(new ErrorHandler("New passwords do not matched.", 400));
    }

    const user = await User.findById(req.user._id).select("+password");

    const isPasswordMatched = await user.matchPassword(oldPassword);

    user.password = newPassword;

    await user.generateToken();
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

    const user = await User.findOne({ email });

    if (!user) {
        return next(new ErrorHandler("User does not exist.", 404));
    }

    // Generating OTP
    const { otp, expiresAt } = await generateOTP();

    const otpObj = await OTP.create({
        otp,
        expiresAt
    });

    user.otp = otpObj._id;

    await user.save();

    const htmlMessage = `<p>Hello ${user.fname},</p>
    <br><p>Your password reset OTP is: </p>
    <br><h1>${otp}</h1><br>
    <p>This OTP is valid for only 15 minutes.</p>
    <p>If you have not requested this email then, please ignore it.</p>
    <p>This is a auto-generated email. Please do not reply to this email.</p>
    <p>Regards, <br>
    NixLab Technologies Team</p>`

    try {
        await sendEmail({
            email: user.email,
            subject: `OTP for Password Reset`,
            htmlMessage: htmlMessage
        });

        res.status(200).json({
            success: true,
            message: "OTP sent."
        });
    } catch (err) {
        return next(new ErrorHandler(err.message, 500));
    }

});


// Reset Password
exports.resetPassword = catchAsyncError(async (req, res, next) => {

    const { otp, newPassword, confirmPassword } = req.body;

    if (!otp) {
        return next(new ErrorHandler("Please enter OTP.", 400));
    }

    if (!newPassword) {
        return next(new ErrorHandler("Please enter new password.", 400));
    }

    if (!confirmPassword) {
        return next(new ErrorHandler("Please enter confirm password.", 400));
    }

    if (newPassword !== confirmPassword) {
        return next(new ErrorHandler("Both Passwords do not matched.", 400));
    }

    const otpObj = await OTP.findOne({ otp });

    if (!otpObj) {
        return next(new ErrorHandler("OTP is invalid.", 401))
    }

    if (otpObj.isVerified === true) {
        return next(new ErrorHandler("OTP is already used.", 401))
    }

    if (dates.compare(otpObj.expiresAt, new Date()) === 1) {

        const user = await User.findOne({
            otp: otpObj._id
        });

        if (!user) {
            return next(new ErrorHandler("OTP is invalid or expired.", 401));
        }

        user.password = newPassword;
        user.otp = undefined;
        otpObj.isVerified = true;

        await user.generateToken();
        await otpObj.save();
        await user.save();

        res.status(200).json({
            success: true,
            message: "Password updated."
        });

    }
    else {
        return next(new ErrorHandler("OTP is expired.", 401));
    }

});


// Upload User Avatar
exports.uploadAvatar = catchAsyncError(async (req, res, next) => {

    const avatar = req.body.avatar;

    if (!avatar) {
        return next(new ErrorHandler("Please provide an avatar image.", 400));
    }

    const user = await User.findById(req.user._id);

    if (user.avatar && user.avatar.public_id) {
        const imageId = user.avatar.public_id;
        await cloudinary.v2.uploader.destroy(imageId);
    }

    await cloudinary.v2.uploader
        .upload(avatar, {
            folder: "avatars"
        }).then(async (result) => {

            user.avatar = {
                public_id: result.public_id,
                url: result.secure_url
            }

            await user.save();

            res.status(200).json({
                success: true,
                message: "User avatar updated."
            });

        }).catch((err) => {

            res.status(200).json({
                success: true,
                message: err.message,
            });

        });
});


// Update User Profile
exports.updateUserProfile = catchAsyncError(async (req, res, next) => {

    const { fname, lname, phone, gender, dob, about } = req.body;

    const user = await User.findById(req.user._id);

    if (fname) {
        if (String(fname).length < 3) {
            return next(new ErrorHandler("First name must be at least 3 characters.", 400));
        }
        else {
            user.fname = fname;
        }
    }

    if (lname) {
        if (String(lname).length < 1) {
            return next(new ErrorHandler("Last name can't be empty.", 400));
        }
        else {
            user.lname = lname;
        }
    }

    if (phone) {
        const phoneRegExp = /^\d{10}$/;
        if (!String(phone.phoneNo).match(phoneRegExp)) {
            return next(new ErrorHandler("Enter a valid phone number.", 400));
        }

        user.phone = phone;
    }

    if (gender) {
        user.gender = gender;
    }

    if (dob) {
        user.dob = dob;
    }

    if (about) {
        user.about = about;
    }

    await user.save();


    res.status(200).json({
        success: true,
        message: "User profile updated."
    });

});


// Check Username Availabilty
exports.checkUsernameAvailability = catchAsyncError(async (req, res, next) => {

    const { uname } = req.body;

    if (!uname) {
        return next(new ErrorHandler("Please enter an username.", 400));
    }

    if (uname && !validateUsername(uname)) {
        return next(new ErrorHandler("Please enter a valid username.", 400));
    }

    const isUsernameAvailable = await checkUsernameAvailable(uname);

    if (isUsernameAvailable) {
        res.status(200).json({
            success: true,
            message: "Username available."
        });
    }
    else {
        res.status(200).json({
            success: false,
            message: "Username not available."
        });
    }

});


// Update Username
exports.updateUsername = catchAsyncError(async (req, res, next) => {

    const { uname } = req.body;

    if (!uname) {
        return next(new ErrorHandler("Please enter an username.", 400));
    }

    if (uname && !validateUsername(uname)) {
        return next(new ErrorHandler("Please enter a valid username.", 400));
    }

    const isUsernameAvailable = await checkUsernameAvailable(uname);

    if (isUsernameAvailable) {

        const user = await User.findById(req.user._id);

        if (uname) {
            user.uname = uname;
        }

        await user.save();

        res.status(200).json({
            success: true,
            message: "Username updated."
        });
    }
    else {
        res.status(200).json({
            success: false,
            message: "Username not available."
        });
    }

});


// Delete User Profile
exports.deleteProfile = catchAsyncError(async (req, res, next) => {

    const user = await User.findById(req.user._id);

    const posts = user.posts;
    const followers = user.followers;
    const followings = user.following;
    const userId = user._id;

    await user.remove();

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


// Search User
exports.searchUser = catchAsyncError(async (req, res, next) => {

    const user = await User.findById(req.query.id);

    if (!user) {
        return next(new ErrorHandler("User not found.", 404));
    }

    res.status(200).json({
        success: true,
        user: {
            _id: user._id,
            fname: user.fname,
            lname: user.lname,
            email: user.email,
            uname: user.uname,
            phone: user.phone,
            avatar: user.avatar,
            gender: user.gender,
            dob: user.dob
        }
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


// Update Account Status -- Admin
exports.updateAccountStatus = catchAsyncError(async (req, res, next) => {

    const { status } = req.body;

    if (!status) {
        return next(new ErrorHandler("Please enter a status.", 400));
    }

    const user = User.findById(req.params.id);

    if (!user) {
        return next(new ErrorHandler("User not found.", 404));
    }

    user.accountStatus = String(status).toLowerCase();

    await user.save();

    res.status(200).json({
        success: true,
        message: "Account status updated."
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