const catchAsyncError = require("../middlewares/catchAsyncError");
const Post = require("../models/PostModel");
const User = require("../models/UserModel");
const ErrorHandler = require("../utils/errorHandler");
const cloudinary = require("cloudinary");


// Create Post
exports.createPost = catchAsyncError(async (req, res, next) => {

    let images = [];

    if (typeof req.body.images === "string") {
        images.push(req.body.images);
    }
    else {
        images = req.body.images;
    }

    const imageLinks = [];

    for (let i = 0; i < images.length; i++) {

        const result = await cloudinary.v2.uploader.upload(
            images[i],
            { folder: "nixlab/posts" }
        );

        imageLinks.push({
            public_id: result.public_id,
            url: result.secure_url
        });

    }

    req.body.images = imageLinks;

    const newPost = {
        caption: req.body.caption,
        images: req.body.images,
        owner: req.user._id
    };

    const post = await Post.create(newPost);

    const user = await User.findById(req.user._id);

    user.posts.push(post._id);

    await user.save();

    res.status(201).json({
        success: true,
        message: "Post created.",
        result: post
    });

});


// Like/Unlike Post
exports.likeAndUnlikePost = catchAsyncError(async (req, res, next) => {

    const post = await Post.findById(req.params.id);

    if (!post) {
        return next(new ErrorHandler("Post does not exist.", 404));
    }

    if (post.likes.includes(req.user._id)) {
        const index = post.likes.indexOf(req.user._id);

        post.likes.splice(index, 1);

        await post.save();

        res.status(200).json({
            success: true,
            message: "Post unliked."
        });
    }
    else {
        post.likes.push(req.user._id);

        await post.save();

        res.status(200).json({
            success: true,
            message: "Post liked."
        });
    }

});


// Delete Post
exports.deletePost = catchAsyncError(async (req, res, next) => {

    const post = await Post.findById(req.params.id);

    if (!post) {
        return next(new ErrorHandler("Post not found.", 404));
    }

    if (post.owner.toString() !== req.user._id.toString()) {
        return next(new ErrorHandler("Unauthorized.", 401));
    }

    for (let i = 0; i < post.images.length; i++) {
        await cloudinary.v2.uploader.destroy(
            post.images[i].public_id
        );
    }

    await post.remove();

    const user = await User.findById(req.user._id);

    const index = user.posts.indexOf(req.params.id);

    user.posts.splice(index, 1);

    await user.save();

    res.status(200).json({
        success: true,
        message: "Post deleted."
    })

});


// Get Following's Post
exports.getFollowingPost = catchAsyncError(async (req, res, next) => {

    const user = await User.findById(req.user._id);

    const posts = await Post.find({
        owner: {
            $in: user.following
        }
    })

    res.status(200).json({
        success: true,
        count: posts.length,
        posts: posts
    })

});


// Get Post Details
exports.getPostDetails = catchAsyncError(async (req, res, next) => {

    const post = await Post.findById(req.params.id);

    if (!post) {
        return next(new ErrorHandler("Post not found.", 404));
    }

    res.status(200).json({
        success: true,
        result: post
    })

});


// Update Post
exports.updatePost = catchAsyncError(async (req, res, next) => {

    const { caption, images } = req.body;

    let postImages = [];

    if (images) {
        if (typeof images === "string") {
            postImages.push(images);
        }
        else {
            postImages = images;
        }
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
        return next(new ErrorHandler("Post not found.", 404));
    }

    if (post.owner.toString() !== req.user._id.toString()) {
        return next(new ErrorHandler("Unauthorized.", 401));
    }

    if (postImages !== undefined) {

        const imageLinks = [];

        for (let i = 0; i < postImages.length; i++) {
            const result = await cloudinary.v2.uploader.upload(
                postImages[i],
                { folder: "nixlab/posts" }
            );

            imageLinks.push({
                public_id: result.public_id,
                url: result.secure_url
            });
        }

        images = imageLinks;

    }

    post.caption = caption;

    post.images = images;

    await post.save();

    res.status(200).json({
        success: true,
        message: "Post updated."
    });

});


// Add Comment
exports.addComment = catchAsyncError(async (req, res, next) => {

    const post = await Post.findById(req.params.id);

    if (!post) {
        return next(new ErrorHandler("Post not found.", 404));
    }

    post.comments.push({
        user: req.user._id,
        comment: req.body.comment
    });

    await post.save();

    res.status(200).json({
        success: true,
        message: "Comment added."
    });

});


// Delete Comment
exports.deleteComment = catchAsyncError(async (req, res, next) => {

    const { commentId } = req.body;

    if (!commentId) {
        return next(new ErrorHandler("Comment Id is empty.", 400));
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
        return next(new ErrorHandler("Post not found.", 404));
    }

    const comment = post.comments.find(item => item._id.toString() === commentId);

    if (
        post.owner.toString() === req.user._id.toString() ||
        comment.user.toString() === req.user._id.toString()
    ) {

        const commentIndex = post.comments.indexOf(commentId.toString());

        post.comments.splice(commentIndex, 1);

        await post.save();

        return res.status(200).json({
            success: true,
            message: "Comment deleted."
        });

    }
    else {
        return next(new ErrorHandler("Unauthorized.", 401));
    }

});