const User = require('../models/User')
const Post = require('../models/Post')

async function reputation(username, post_id, rating) {
    const user = await User.findOne({ username: username})
    console.log(user)
    Post.findById(post_id, (err, post) => {
        let ratingData = user.ratingData;
        console.log(ratingData)
        ratingData[post_id] = rating;
        console.log(ratingData)
        user.ratingData = ratingData;
        console.log(user.ratingData)
        postRating = post.rating;
        let rep = Math.abs(postRating - rating)
        if (rep > 10) {
            rep = 0;
        }
        else {
            rep = 10 - rep
        }
        rep = Math.floor(rep)
        user.reputation = user.reputation + rep;
        user.save();
    }).catch((err) => {
        console.log(err);
    })
}

module.exports = reputation;