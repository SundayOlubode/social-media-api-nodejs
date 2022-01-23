const catchAsyncError = require("../middlewares/catchAsyncError");
const Post = require("../models/PostModel");
const User = require("../models/userModel");
const ErrorHandler = require("../utils/errorHandler");


// Create Post
exports.createPost = catchAsyncError(async (req, res, next) => {

    const newPost = {
        caption: req.body.caption,
        image: {
            public_id: 'smaple_pub_id',
            url: 'sample_url'
        },
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

    const user = await User.findById(req.user._id);

    await post.remove();

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


// Update Post
exports.updatePost = catchAsyncError(async (req, res, next) => {

    const { caption } = req.body;

    const post = await Post.findById(req.params.id);

    if (!post) {
        return next(new ErrorHandler("Post not found.", 404));
    }

    if (post.owner.toString() !== req.user._id.toString()) {
        return next(new ErrorHandler("Unauthorized.", 401));
    }

    post.caption = caption;

    await post.save();

    res.status(200).json({
        success: true,
        message: "Post updated."
    });

});