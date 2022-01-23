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
    getAllUsers
} = require("../controllers/UserController");
const { isAuthenticatedUser } = require("../middlewares/auth");

const router = express.Router();


// Routes
router.route("/register").post(register);

router.route("/login").post(login);

router.route("/logout").get(logout);

router.route("/me").get(isAuthenticatedUser, getProfileDetails);

router.route("/follow/:id").get(isAuthenticatedUser, followUser);

router.route("/update/password").put(isAuthenticatedUser, updatePassword);

router.route("/update/profile").put(isAuthenticatedUser, updateUserProfile);

router.route("/delete/me").delete(isAuthenticatedUser, deleteProfile);

router.route("/user/:id").get(isAuthenticatedUser, getUserProfileDetails);

router.route("/admin/users").get(isAuthenticatedUser, getAllUsers);


module.exports = router;