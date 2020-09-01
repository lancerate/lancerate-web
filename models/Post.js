const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    user_age: {
        type: Number,
        required: false
    },
    field_experience: {
        type: Number,
        required: false
    },
    portfolio_link: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    reviewers: {
        type: Number,
        required: false
    },
    reviewers_usernames: {
        type: Array,
        required: false
    },
    reviews: {
        type: Array,
        required: false
    },
    date: {
        type: Date,
        default: Date.now
    },
    recommendations: {
        type: Object,
        required: false
    },
    rating: {
        type: Number,
        default: 0
    }
})

const Post = mongoose.model('Post', PostSchema);

module.exports = Post;