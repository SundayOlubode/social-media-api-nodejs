import { Router } from "express";
import {
    register, login, followUser, logout,
    changePassword, updateUserProfile,
    deleteProfile, getProfileDetails,
    getUserProfileDetails, getAllUsers,
    forgotPassword, resetPassword,
    uploadAvatar, updateUserRole,
    deleteUser, checkUsernameAvailability,
    changeUsername, searchUser,
    updateAccountStatus, sendVerificationEmail,
    verifyAccount, getRandomUsers, getFollowingUserList,
    getFollowersUserList
} from "../controllers/index.js";
import {
    isAuthenticatedUser, authorizeRoles
} from "../../../middlewares/auth.js";
import multer from '../../../middlewares/multer.js';

const userRouter = Router();


// Public Routes
userRouter.route("/register").post(register);

userRouter.route("/login").post(login);

userRouter.route("/logout").get(logout);

userRouter.route("/forgot-password").post(forgotPassword);

userRouter.route("/reset-password").post(resetPassword);

userRouter.route("/check-username").post(checkUsernameAvailability);


// Authenticated Routes
userRouter.route("/me").get(isAuthenticatedUser, getProfileDetails);

userRouter.route("/follow-user").get(isAuthenticatedUser, followUser);

userRouter.route("/change-password").post(isAuthenticatedUser, changePassword);

userRouter.route("/verify-email")
    .get(isAuthenticatedUser, sendVerificationEmail)
    .post(isAuthenticatedUser, verifyAccount);

userRouter.route("/update-profile-details")
    .put(isAuthenticatedUser, updateUserProfile);

userRouter.route("/change-username").post(isAuthenticatedUser, changeUsername);

userRouter.route("/upload-avatar")
    .post(multer.single('avatar'), isAuthenticatedUser, uploadAvatar);

userRouter.route("/delete-profile").delete(isAuthenticatedUser, deleteProfile);

userRouter.route("/profile-details").get(isAuthenticatedUser, getUserProfileDetails);

userRouter.route("/search-user").get(isAuthenticatedUser, searchUser);

userRouter.route("/get-following-list")
    .get(isAuthenticatedUser, getFollowingUserList);

userRouter.route("/get-followers-list")
    .get(isAuthenticatedUser, getFollowersUserList);

userRouter.route("/get-random-users")
    .get(isAuthenticatedUser, getRandomUsers);


// Admin Routes
userRouter.route("/admin/users")
    .get(isAuthenticatedUser, authorizeRoles("admin"), getAllUsers);

userRouter.route("/admin/user/:id")
    .get(isAuthenticatedUser, authorizeRoles("admin"), getUserProfileDetails)
    .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteUser);

userRouter.route("/admin/user/update/role/:id")
    .put(isAuthenticatedUser, authorizeRoles("admin"), updateUserRole);

userRouter.route("/admin/user/update/status/:id")
    .put(isAuthenticatedUser, authorizeRoles("admin"), updateAccountStatus);


export default userRouter;