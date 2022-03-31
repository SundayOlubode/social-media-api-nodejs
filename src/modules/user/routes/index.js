import { Router } from "express";
import {
    register, login, followUser, logout,
    updatePassword, updateUserProfile,
    deleteProfile, getProfileDetails,
    getUserProfileDetails, getAllUsers,
    forgotPassword, resetPassword,
    uploadAvatar, updateUserRole,
    deleteUser, checkUsernameAvailability,
    updateUsername, searchUser,
    updateAccountStatus, sendVerificationEmail,
    verifyAccount, getRandomUsers
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

userRouter.route("/forgot/password").post(forgotPassword);

userRouter.route("/reset/password").put(resetPassword);

userRouter.route("/check/username").post(checkUsernameAvailability);


// Authenticated Routes
userRouter.route("/me").get(isAuthenticatedUser, getProfileDetails);

userRouter.route("/follow/:id").get(isAuthenticatedUser, followUser);

userRouter.route("/update/password").put(isAuthenticatedUser, updatePassword);

userRouter.route("/verify/me")
    .get(isAuthenticatedUser, sendVerificationEmail)
    .put(isAuthenticatedUser, verifyAccount);

userRouter.route("/update/me").put(isAuthenticatedUser, updateUserProfile);

userRouter.route("/update/username").put(isAuthenticatedUser, updateUsername);

userRouter.route("/avatar/me")
    .post(multer.single('avatar'), isAuthenticatedUser, uploadAvatar);

userRouter.route("/delete/me").delete(isAuthenticatedUser, deleteProfile);

userRouter.route("/user/:id").get(isAuthenticatedUser, getUserProfileDetails);

userRouter.route("/user").get(isAuthenticatedUser, searchUser);

userRouter.route("/users")
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