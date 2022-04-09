import { Router } from "express";
import {
    createPost, likeAndUnlikePost, deletePost,
    getFollowingPosts, updatePost, getPostDetails,
    addComment, deleteComment, getAllPosts,
    likeAndUnlikeComment, getAllComments
} from "../controllers/index.js";
import { isAuthenticatedUser, authorizeRoles } from "../../../middlewares/auth.js";
import multer from '../../../middlewares/multer.js';

const postRouter = Router();


// Routes
postRouter.route("/create-post")
    .post(multer.array("images"), isAuthenticatedUser, createPost);

postRouter.route("/post")
    .get(isAuthenticatedUser, getPostDetails)
    .put(isAuthenticatedUser, updatePost)
    .delete(isAuthenticatedUser, deletePost);

postRouter.route("/like-post")
    .get(isAuthenticatedUser, likeAndUnlikePost)

postRouter.route("/get-posts").get(isAuthenticatedUser, getFollowingPosts);

postRouter.route("/add-comment")
    .post(isAuthenticatedUser, addComment);

postRouter.route("/get-comments")
    .get(isAuthenticatedUser, getAllComments);

postRouter.route("/like-comment")
    .get(isAuthenticatedUser, likeAndUnlikeComment);

postRouter.route("/delete-comment")
    .delete(isAuthenticatedUser, deleteComment);


// Admin Routes
postRouter.route("/admin/get-posts")
    .get(isAuthenticatedUser, authorizeRoles("admin"), getAllPosts);


export default postRouter;