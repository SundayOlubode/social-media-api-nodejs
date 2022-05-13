import cloudinary from "cloudinary";
import fs from "fs";
import catchAsyncError from "../../../helpers/catchAsyncError.js";
import ErrorHandler from "../../../helpers/errorHandler.js";
import Post from "../models/post.js";
import User from "../../user/models/user.js";
import Comment from "../models/comment.js";

// Create Post
export const createPost = catchAsyncError(async (req, res, next) => {
  const images = req.files;
  //console.log(images);

  if (!images || images?.length <= 0) {
    return next(
      new ErrorHandler("Please provide atleast one post image.", 400)
    );
  }

  for (let i = 0; i < images.length; i++) {
    let tempImage = images[i];

    const fileSize = tempImage.size / 1024;

    if (fileSize > 2048) {
      return next(
        new ErrorHandler("Each image size must be lower than 2mb.", 413)
      );
    }
  }

  let imageLinks = [];

  for (let i = 0; i < images.length; i++) {
    let fileTempPath = images[i].path;

    await cloudinary.v2.uploader
      .upload(fileTempPath, {
        folder: "social_media_api/posts",
      })
      .then(async (result) => {
        imageLinks.push({
          public_id: result.public_id,
          url: result.secure_url,
        });

        fs.unlink(fileTempPath, (err) => {
          if (err) console.log(err);
        });
      })
      .catch((err) => {
        fs.unlink(fileTempPath, (fileErr) => {
          if (fileErr) console.log(fileErr);
        });

        console.log(err);

        res.status(400).json({
          success: false,
          message: "An error occurred in uploading image to server.",
        });
      });
  }

  const newPost = {
    caption: req.body.caption,
    owner: req.user._id,
  };

  newPost.images = imageLinks;

  const post = await Post.create(newPost);

  const user = await User.findById(req.user._id);

  user.posts.push(post._id);

  await user.save();

  res.status(201).json({
    success: true,
    message: "Post created.",
    post,
  });
});

// Like/Unlike Post
export const likeAndUnlikePost = catchAsyncError(async (req, res, next) => {
  const post = await Post.findById(req.query.id);

  if (!post) {
    return next(new ErrorHandler("Post does not exist.", 404));
  }

  if (post.likes.includes(req.user._id)) {
    const index = post.likes.indexOf(req.user._id);

    post.likes.splice(index, 1);

    await post.save();

    res.status(200).json({
      success: true,
      message: "Post unliked.",
    });
  } else {
    post.likes.push(req.user._id);

    await post.save();

    res.status(200).json({
      success: true,
      message: "Post liked.",
    });
  }
});

// Update Post
export const updatePost = catchAsyncError(async (req, res, next) => {
  const { caption } = req.body;

  const post = await Post.findById(req.params.id);

  if (!post) {
    return next(new ErrorHandler("Post not found.", 404));
  }

  if (post.owner.toString() !== req.user._id.toString()) {
    return next(new ErrorHandler("Unauthorized.", 401));
  }

  if (caption) {
    post.caption = caption;
  }

  if (req.body.images) {
    if (post.images.length > 0) {
      for (let i = 0; i < post.images.length; i++) {
        await cloudinary.v2.uploader.destroy(post.images[i].public_id);
      }
    }

    let postImages = [];

    if (typeof req.body.images === "string") {
      postImages.push(req.body.images);
    } else {
      postImages = req.body.images;
    }

    if (postImages !== undefined) {
      let imageLinks = [];

      for (let i = 0; i < postImages.length; i++) {
        const result = await cloudinary.v2.uploader.upload(postImages[i], {
          folder: "nixlab/posts",
        });

        imageLinks.push({
          public_id: result.public_id,
          url: result.secure_url,
        });
      }

      req.body.images = imageLinks;

      post.images = req.body.images;
    }
  }

  await post.save();

  res.status(200).json({
    success: true,
    message: "Post updated.",
  });
});

// Delete Post
export const deletePost = catchAsyncError(async (req, res, next) => {
  const post = await Post.findById(req.query.id);

  if (!post) {
    return next(new ErrorHandler("Post not found.", 404));
  }

  if (post.owner.toString() !== req.user._id.toString()) {
    return next(new ErrorHandler("Unauthorized.", 401));
  }

  for (let i = 0; i < post.images.length; i++) {
    await cloudinary.v2.uploader.destroy(post.images[i].public_id);
  }

  await post.remove();

  const user = await User.findById(req.user._id);

  const index = user.posts.indexOf(req.params.id);

  user.posts.splice(index, 1);

  await user.save();

  res.status(200).json({
    success: true,
    message: "Post deleted.",
  });
});

// Get Following's Post
export const getFollowingPosts = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    return next(new ErrorHandler("User not found.", 404));
  }

  const posts = await Post.find({
    owner: {
      $in: [...user.following, user._id],
    },
  })
    .populate("owner", [
      "_id",
      "fname",
      "lname",
      "email",
      "uname",
      "avatar",
      "profession",
      "accountType",
      "accountStatus",
      "isVerified",
    ])
    .sort({
      createdAt: -1,
    });

  res.status(200).json({
    success: true,
    count: posts.length,
    posts,
  });
});

// Get All Posts -- Admin
export const getAllPosts = catchAsyncError(async (req, res, next) => {
  const posts = await Post.find()
    .populate("owner", [
      "_id",
      "fname",
      "lname",
      "email",
      "uname",
      "avatar",
      "profession",
      "accountType",
      "accountStatus",
      "isVerified",
    ])
    .sort({
      createdAt: -1,
    });

  res.status(200).json({
    success: true,
    count: posts.length,
    posts,
  });
});

// Get Post Details
export const getPostDetails = catchAsyncError(async (req, res, next) => {
  const post = await Post.findById(req.query.id).populate([
    {
      path: "owner",
      model: "User",
      select: [
        "_id",
        "fname",
        "lname",
        "email",
        "uname",
        "avatar",
        "profession",
        "accountType",
        "accountStatus",
        "isVerified",
      ],
    },
    {
      path: "comments",
      model: "Comment",
      populate: [
        {
          path: "user",
          model: "User",
          select: [
            "_id",
            "fname",
            "lname",
            "email",
            "uname",
            "avatar",
            "profession",
            "accountType",
            "accountStatus",
            "isVerified",
          ],
        },
      ],
      options: {
        sort: {
          createdAt: -1,
        },
      },
    },
  ]);

  if (!post) {
    return next(new ErrorHandler("Post not found.", 404));
  }

  res.status(200).json({
    success: true,
    post,
  });
});

// Add Comment
export const addComment = catchAsyncError(async (req, res, next) => {
  const { comment } = req.body;

  if (!comment) {
    return next(new ErrorHandler("Please enter a comment.", 400));
  }

  const post = await Post.findById(req.query.postId);

  if (!post) {
    return next(new ErrorHandler("Post not found.", 404));
  }

  const newComment = await Comment.create({
    comment: comment,
    user: req.user._id,
    post: post._id,
  });

  post.comments.push(newComment._id);

  await post.save();

  res.status(200).json({
    success: true,
    message: "Comment added.",
  });
});

// Get All Comments
export const getAllComments = catchAsyncError(async (req, res, next) => {
  const comments = await Comment.find({
    post: req.query.postId,
  })
    .populate("user", [
      "_id",
      "fname",
      "lname",
      "email",
      "uname",
      "avatar",
      "profession",
      "accountType",
      "accountStatus",
      "isVerified",
    ])
    .sort({
      createdAt: -1,
    });

  res.status(200).json({
    success: true,
    count: comments.length,
    comments,
  });
});

// Like/Unlike Commnet
export const likeAndUnlikeComment = catchAsyncError(async (req, res, next) => {
  const comment = await Comment.findById(req.query.id);

  if (!comment) {
    return next(new ErrorHandler("Comment does not exist.", 404));
  }

  if (comment.likes.includes(req.user._id)) {
    const index = comment.likes.indexOf(req.user._id);

    comment.likes.splice(index, 1);

    await comment.save();

    res.status(200).json({
      success: true,
      message: "Comment unliked.",
    });
  } else {
    comment.likes.push(req.user._id);

    await comment.save();

    res.status(200).json({
      success: true,
      message: "Comment liked.",
    });
  }
});

// Delete Comment
export const deleteComment = catchAsyncError(async (req, res, next) => {
  const comment = await Comment.findById(req.query.id);

  if (!comment) {
    return next(new ErrorHandler("Comment does not exist.", 404));
  }

  const post = await Post.findById(comment.post);

  if (!post) {
    return next(new ErrorHandler("Post not found.", 404));
  }

  if (
    post.owner.toString() === req.user._id.toString() ||
    comment.user.toString() === req.user._id.toString()
  ) {
    await comment.remove();

    const commentIndex = post.comments.indexOf(comment._id);

    post.comments.splice(commentIndex, 1);

    await post.save();

    return res.status(200).json({
      success: true,
      message: "Comment deleted.",
    });
  } else {
    return next(new ErrorHandler("Unauthorized.", 401));
  }
});
