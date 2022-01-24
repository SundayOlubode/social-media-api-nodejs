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
    deleteUser
} = require("../controllers/UserController");
const { isAuthenticatedUser, authorizeRoles } = require("../middlewares/auth");

const router = express.Router();


// Routes
router.route("/register").post(register);

router.route("/login").post(login);

router.route("/logout").get(logout);

router.route("/me").get(isAuthenticatedUser, getProfileDetails);

router.route("/follow/:id").get(isAuthenticatedUser, followUser);

router.route("/update/password").put(isAuthenticatedUser, updatePassword);

router.route("/forgot/password").post(forgotPassword);

router.route("reset/password/:token").put(resetPassword);

router.route("/update/me").put(isAuthenticatedUser, updateUserProfile);

router.route("/avatar/me").put(isAuthenticatedUser, uploadAvatar);

router.route("/delete/me").delete(isAuthenticatedUser, deleteProfile);

router.route("/user/:id").get(isAuthenticatedUser, getUserProfileDetails);

router.route("/admin/users").get(isAuthenticatedUser, getAllUsers);

router.route("/admin/user/:id")
    .get(isAuthenticatedUser, authorizeRoles("admin"), getUserProfileDetails)
    .put(isAuthenticatedUser, authorizeRoles("admin"), updateUserRole)
    .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteUser);


module.exports = router;