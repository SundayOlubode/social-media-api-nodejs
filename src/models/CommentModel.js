const mongoose = require("mongoose");


const commentSchema = new mongoose.Schema({

    comment: {
        type: String,
        required: true
    },

    user: {
        type: mongoose.Types.ObjectId,
        ref: "User"
    },

    post: {
        type: mongoose.Types.ObjectId,
        ref: "Post"
    },

    likes: [
        {
            type: mongoose.Types.ObjectId,
            ref: "User"
        }
    ],

    createdAt: {
        type: Date,
        default: Date.now
    },

})


module.exports = mongoose.model("Comment", commentSchema);