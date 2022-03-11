const express = require("express");
const {
    createPost,
    likeAndUnlikePost,
    deletePost,
    getFollowingPosts,
    updatePost,
    getPostDetails,
    addComment,
    deleteComment,
    getAllPosts,
    likeAndUnlikeComment,
    getCommentDetails,
    getAllComments
} = require("../controllers");
const { isAuthenticatedUser } = require("../../../middlewares/auth");

const router = express.Router();


// Routes

router.route("/post/create").post(isAuthenticatedUser, createPost);

router.route("/post/:id")
    .get(isAuthenticatedUser, getPostDetails)
    .put(isAuthenticatedUser, updatePost)
    .delete(isAuthenticatedUser, deletePost);

router.route("/post/like/:id")
    .get(isAuthenticatedUser, likeAndUnlikePost)

router.route("/posts").get(isAuthenticatedUser, getFollowingPosts);

router.route("/post/:id/comment/add")
    .post(isAuthenticatedUser, addComment);

router.route("/post/comment/like/:id")
    .get(isAuthenticatedUser, likeAndUnlikeComment);

router.route("/post/:id/comments")
    .get(isAuthenticatedUser, getAllComments);

router.route("/post/comment/:id")
    .get(isAuthenticatedUser, getCommentDetails)
    .delete(isAuthenticatedUser, deleteComment);


// Admin Routes

router.route("/admin/posts").get(isAuthenticatedUser, getAllPosts);


module.exports = router;