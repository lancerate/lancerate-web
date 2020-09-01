const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        required: true
    },
    gender: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true
    },
    code: {
        type: String,
        required: false
    },
    categories: {
        type: Array,
        required: false
    },
    reviews_done: {
        type: Number,
        required: false,
        default: 0
    },
    date: {
        type: Date,
        default: Date.now
    },
    badge: {
        type: Boolean,
        default: false
    }
})

const User = mongoose.model('User', UserSchema);

module.exports = User;