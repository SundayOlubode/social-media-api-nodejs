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
    getAllPosts
} = require("../controllers/PostController");
const { isAuthenticatedUser } = require("../middlewares/auth");

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

router.route("/post/comment/:id")
    .post(isAuthenticatedUser, addComment)
    .delete(isAuthenticatedUser, deleteComment);


// Admin Routes

router.route("/admin/posts").get(isAuthenticatedUser, getAllPosts);


module.exports = router;