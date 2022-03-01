const mongoose = require("mongoose");


const postSchema = new mongoose.Schema({

    caption: String,

    images: [
        {
            public_id: String,
            url: String
        }
    ],

    owner: {
        type: mongoose.Types.ObjectId,
        ref: "User"
    },

    likes: [
        {
            type: mongoose.Types.ObjectId,
            ref: "User"
        }
    ],

    comments: [
        {
            user: {
                type: mongoose.Types.ObjectId,
                ref: "User"
            },
            comment: {
                type: String,
                required: true
            }
        }
    ],

    postStatus: {
        type: String,
        default: "active"
    },

    createdAt: {
        type: Date,
        default: Date.now
    },

})

module.exports = mongoose.model("Post", postSchema);