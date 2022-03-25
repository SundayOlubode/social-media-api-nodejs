const express = require("express");
const {
    register,
    login,
    followUser,
    logout,
    updatePassword,
    updateUserProfile,
    deleteProfile,
    getProfileDetails,
    getUserProfileDetails,
    getAllUsers,
    forgotPassword,
    resetPassword,
    uploadAvatar,
    updateUserRole,
    deleteUser,
    checkUsernameAvailability,
    updateUsername,
    searchUser,
    updateAccountStatus,
    sendVerificationEmail,
    verifyAccount
} = require("../controllers");
const { isAuthenticatedUser, authorizeRoles } = require("../../../middlewares/auth");

const router = express.Router();


// Public Routes
router.route("/register").post(register);

router.route("/login").post(login);

router.route("/logout").get(logout);

router.route("/forgot/password").post(forgotPassword);

router.route("/reset/password").put(resetPassword);

router.route("/check/username").post(checkUsernameAvailability);


// Authenticated Routes
router.route("/me").get(isAuthenticatedUser, getProfileDetails);

router.route("/follow/:id").get(isAuthenticatedUser, followUser);

router.route("/update/password").put(isAuthenticatedUser, updatePassword);

router.route("/verify/me")
    .get(isAuthenticatedUser, sendVerificationEmail)
    .put(isAuthenticatedUser, verifyAccount);

router.route("/update/me").put(isAuthenticatedUser, updateUserProfile);

router.route("/update/username").put(isAuthenticatedUser, updateUsername);

router.route("/avatar/me").put(isAuthenticatedUser, uploadAvatar);

router.route("/delete/me").delete(isAuthenticatedUser, deleteProfile);

router.route("/user/:id").get(isAuthenticatedUser, getUserProfileDetails);

router.route("/user").get(isAuthenticatedUser, searchUser);


// Admin Routes
router.route("/admin/users")
    .get(isAuthenticatedUser, authorizeRoles("admin"), getAllUsers);

router.route("/admin/user/:id")
    .get(isAuthenticatedUser, authorizeRoles("admin"), getUserProfileDetails)
    .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteUser);

router.route("/admin/user/update/role/:id")
    .put(isAuthenticatedUser, authorizeRoles("admin"), updateUserRole);

router.route("/admin/user/update/status/:id")
    .put(isAuthenticatedUser, authorizeRoles("admin"), updateAccountStatus);


module.exports = router;