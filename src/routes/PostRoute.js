const express = require("express");
const { createPost, likeAndUnlikePost, deletePost, getFollowingPost, updatePost } = require("../controllers/PostController");
const { isAuthenticatedUser } = require("../middlewares/auth");

const router = express.Router();


// Routes
router.route("/post/create").post(isAuthenticatedUser, createPost);

router.route("/post/:id")
    .get(isAuthenticatedUser, likeAndUnlikePost)
    .put(isAuthenticatedUser, updatePost)
    .delete(isAuthenticatedUser, deletePost);

router.route("/posts").get(isAuthenticatedUser, getFollowingPost);


module.exports = router;