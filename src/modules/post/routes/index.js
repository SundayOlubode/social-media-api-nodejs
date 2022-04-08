import { Router } from "express";
import {
    createPost, likeAndUnlikePost, deletePost,
    getFollowingPosts, updatePost, getPostDetails,
    addComment, deleteComment, getAllPosts,
    likeAndUnlikeComment, getCommentDetails, getAllComments
} from "../controllers/index.js";
import { isAuthenticatedUser, authorizeRoles } from "../../../middlewares/auth.js";
import multer from '../../../middlewares/multer.js';

const postRouter = Router();


// Routes
postRouter.route("/create-post")
    .post(multer.array("images"), isAuthenticatedUser, createPost);

postRouter.route("/post/:id")
    .get(isAuthenticatedUser, getPostDetails)
    .put(isAuthenticatedUser, updatePost)
    .delete(isAuthenticatedUser, deletePost);

postRouter.route("/like-post/:id")
    .get(isAuthenticatedUser, likeAndUnlikePost)

postRouter.route("/get-posts").get(isAuthenticatedUser, getFollowingPosts);

postRouter.route("/post/:id/comment/add")
    .post(isAuthenticatedUser, addComment);

postRouter.route("/post/comment/like/:id")
    .get(isAuthenticatedUser, likeAndUnlikeComment);

postRouter.route("/post/:id/comments")
    .get(isAuthenticatedUser, getAllComments);

postRouter.route("/post/comment/:id")
    .get(isAuthenticatedUser, getCommentDetails)
    .delete(isAuthenticatedUser, deleteComment);


// Admin Routes
postRouter.route("/admin/posts")
    .get(isAuthenticatedUser, authorizeRoles("admin"), getAllPosts);


export default postRouter;