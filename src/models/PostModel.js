const mongoose = require("mongoose");


const postSchema = new mongoose.Schema({

    caption: String,

    image: {
        public_id: String,
        url: String
    },

    owner: {
        type: mongoose.Types.ObjectId,
        ref: "User"
    },

    createdAt: {
        type: Date,
        default: Date.now
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

})

module.exports = mongoose.model("Post", postSchema);