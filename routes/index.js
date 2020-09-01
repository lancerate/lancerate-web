const express = require('express');
const router = express.Router();
const User = require('../models/User')
const Post = require('../models/Post')
const bcrypt = require('bcryptjs')
const passport = require('passport')
const { ensureAuthenticated } = require('../config/auth');
const nodemailer = require('nodemailer')
let consCriticism = require('../config/constructiveCriticismAlgo')
const stats = require('stats-lite');
const { json } = require('express');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'anshulsaha15@gmail.com',
      pass: process.env.EMAIL_PASS
    }
});

function randomStr(len, arr) { 
    var ans = ''; 
    for (var i = len; i > 0; i--) { 
        ans +=  
          arr[Math.floor(Math.random() * arr.length)]; 
    } 
    return ans; 
} 

router.get('/', (req, res) => res.redirect('/login'))

router.get('/dashboard', ensureAuthenticated, (req, res) => {
    Post.find({'category': 'Web Development' }, function(err, webd_posts) {
        Post.find({'category': 'App Development' }, function(err, appd_posts) {
            Post.find({'category': 'Design' }, function(err, design_posts) {
                Post.find({'category': 'UI/UX Design' }, function(err, ui_posts) {
                   User.findById(req.user.id, (err, user) => {
                       const categories = user.categories
                       if (categories.includes('App Development') == false) {
                            appd_posts = []
                       }
                        if (categories.includes('Web Development') == false) {
                            webd_posts = []
                        }
                        if (categories.includes('UI/UX Design') == false) {
                            ui_posts = []
                        }
                        if (categories.includes('Design') == false) {
                            design_posts = []
                        }
                        const username = req.user.username
                        for (let i = 0; i < webd_posts.length; i++) {
                            let lst = webd_posts[i].reviewers_usernames
                            if (lst.includes(username) ==  true) {
                                webd_posts.splice(i, 1)
                            }
                        }
                        for (let i = 0; i < appd_posts.length; i++) {
                            let lst = appd_posts[i].reviewers_usernames
                            if (lst.includes(username) ==  true) {
                                appd_posts.splice(i, 1)
                            }
                        }
                        for (let i = 0; i < ui_posts.length; i++) {
                            let lst = ui_posts[i].reviewers_usernames
                            if (lst.includes(username) ==  true) {
                                ui_posts.splice(i, 1)
                            }
                        }
                        for (let i = 0; i < design_posts.length; i++) {
                            let lst = design_posts[i].reviewers_usernames
                            if (lst.includes(username) ==  true) {
                                design_posts.splice(i, 1)
                            }
                        }
                       res.render('dashboard', {
                        name: req.user.username,
                        ui_posts,
                        webd_posts,
                        appd_posts,
                        design_posts
                       })
                   })
                })
            })
        })
    })
    
})
    


router.get('/login', (req, res) => res.render('login', {layout: false}));

router.get('/register', (req, res) => res.render('register', {layout: false}));

router.post('/register', (req, res) => {
    const { username, email, password, name, age, gender } = req.body;
    let errors = [];

    if(!username || !email || !password || !name || !age || !gender) {
        errors.push({ msg: 'Please fill in all fields' });
    }

    if(password.length < 6) {
        errors.push({ msg: 'Password should be atleast 6 characters' })
    }

    if(age < 16) {
        errors.push({ msg: 'Age must be 16 or higher'})
    }

    if(errors.length > 0) {
        res.render('register', {
            errors,
            username,
            email,
            password,
            name,
            age,
            gender,
            layout: false
        })
    } else {
        User.findOne({ email: email })
            .then(user => {
                if(user) {
                    errors.push({ msg: 'Email is already registered' })
                    res.render('register', {
                        errors,
                        username,
                        email,
                        password,
                        name,
                        age,
                        gender,
                        layout: false
                    })
                } else {
                    User.findOne({ username: username })
                    .then(user => {
                        if(user) {
                            errors.push({ msg: 'Username is taken' })
                            res.render('register', {
                                errors,
                                username,
                                email,
                                password,
                                name,
                                age,
                                gender,
                                layout: false
                            })
                        } else {
                            const code = randomStr(5, '12345abcde')
                            console.log(code)
                            const mail = {
                                from: 'anshulsaha15@gmail.com',
                                to: email,
                                subject: '[Lancerate] Verification Code',
                                text: 'The verification code is ' + code
                            };
                              
                            transporter.sendMail(mail, function(error, info){
                                if (error) {
                                    console.log(error);
                                } else {
                                    console.log('Email sent: ' + info.response);
                                }
                            });
                            const newUser = new User({
                                username,
                                email,
                                password,
                                name,
                                age,
                                gender,
                                status: 'unverified',
                                code: code
                            })
                            
                            bcrypt.genSalt(10, (err, salt) => bcrypt.hash(newUser.password, salt, (err, hash) => {
                                if(err) throw err;
                            
                                newUser.password = hash;
                            
                                newUser.save()
                                    .then(user => {
                                        res.render('email-verify', {
                                            email: user.email,
                                            id: user.id,
                                            layout: false
                                        })
                                    })
                                    .catch(err => console.log(err))
                            })
                            
                            )
                        }
                    })
                }
            })
    }

})

router.post('/email-verify', (req, res) => {
    const { email, id, code } = req.body;
    let errors = [];

    if(!code) {
        errors.push({ msg: 'Please fill in all fields' });
    }

    User.findById(id, function (err, user) {
        const crct_code = user.code

        if(crct_code != code) {
            errors.push({ msg: 'Code does not match' })
            res.render('email-verify', {
                errors,
                email,
                id,
                layout: false
            })
        }

        user.status = 'verified'
        user.save(function (err) {
            if(err) {
                console.log(err)
            }
            res.render('choose-category', {
                id,
                layout: false
            })
        })
    })
})

router.post('/choose-category', (req, res) => {
    const { categories, id } = req.body;
    User.findById(id, function (err, user) {
        user.categories = categories
        user.save(function (err) {
            if(err) {
                console.log(err)
            }
            req.flash('success_msg', 'You can now login');
            res.redirect('/login')
        })
    })
})

router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/dashboard',
        failureRedirect: '/login',
        failureFlash: true
    })(req, res , next);
})

router.get('/logout', (req, res, next) => {
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/')
})

router.get('/post', ensureAuthenticated, (req, res) => res.render('post'))

router.post('/post', ensureAuthenticated, (req, res) => {
    const { portfolio_link, message, categories, field_experience } =  req.body
    User.findById(req.user.id, (err, user) => {
        const newPost = new Post({
            username: req.user.username,
            user_age: user.age,
            field_experience: field_experience,
            portfolio_link,
            message,
            category: categories,
            reviewers: 0
        })
        newPost.save()
            .then(post => {
                req.flash('success_msg', 'Your post was successfully created')
                res.redirect('/dashboard')
            })
            .catch(err => console.log(err))
    })

})

router.post('/rate', ensureAuthenticated, (req, res) => {
    const { post_id, rating, recommendation } = req.body
    consCriticism(recommendation).then((recommendation => {
        console.log(recommendation)
        Post.findById(post_id, function(err, post) {
            post.reviewers ++
            post.save(function (err) {
                if(err) {
                    console.log(err)
                }
                Post.findByIdAndUpdate(post_id, { $push: { reviews: {'username': req.user.username, 'rating': rating }, recommendations: {'username': req.user.username, 'recommendation': recommendation}  } }, function(err, success) {
                    if(err) {
                        console.log(err)
                    }
                    Post.findByIdAndUpdate(post_id, { $push: { reviewers_usernames: req.user.username } }, function(err, success) {
                        if(err) {
                            console.log(err)
                        }
                        User.findById(req.user.id, function(err, user) {
                            user.reviews_done = user.reviews_done + 1
                            user.save(function(err) {
                                if(err) {
                                    console.log(err) 
                                }
                                req.flash('success_msg', 'Your review was submitted');
                                res.redirect('/dashboard')
                            })
                        })
                    })
                })
            
            })
            console.log(err)
        })  
    })) 
})

router.get('/profile', ensureAuthenticated, (req, res) => {
    Post.find({ 'username' : req.user.username }, function(err, user_history_posts) {
        const user_history = user_history_posts
        if(err) {
            console.log(err)
        }
        Post.find({ 'reviews.username' : req.user.username }, function (err, user_review_posts) {
            if(err) {
                console.log(err)
            }
            const user_reviews = user_review_posts
            User.findById(req.user.id, (err, user) => {
                const full_name = user.name
                res.render('profile', {
                    name: user.name,
                    username: user.username,
                    user_history: user_history,
                    user_reviews: user_reviews
                })
            })
            
        })
    })
    
})

router.post('/results', ensureAuthenticated, (req, res) => {
    const { post_id } = req.body;
    Post.findById(post_id, function(err, post) {
        const reviews = post.reviews;
        let reviews_array = [];
        let rating = stats.mode(reviews_array);
        reviews.forEach((element) => {
            reviews_array.push(Number(element['rating']))
        })
        if (rating != Number) {
            rating = stats.mean(reviews_array)
        }
        const feedback_messages = post.recommendations
        console.log(reviews_array)
        console.log(rating)
        var counts = {};
        for (var i = 0; i < reviews_array.length; i++) {
        var num = reviews_array[i];
        counts[num] = counts[num] ? counts[num] + 1 : 1;
        }
        var review_data = []
        for (const [key, value] of Object.entries(counts)) {
            review_data.push({x: Number(key), value: value})
          }
        console.log(review_data)
        res.render('results', {
            feedback_messages: feedback_messages,
            name: req.user.username,
            post: post,
            rating: rating,
            review_data: review_data
        })
    })
})

router.get('/leaderboard', ensureAuthenticated, (req, res) => {
    User.find({'status':'verified'}).sort({'reviews_done': -1}).exec( function(err, users) {
        res.render('leaderboard', {
            users: users
        })
    })
})

router.post('/rate-portfolio', ensureAuthenticated, (req, res) => {
    const { post_id } = req.body;
    res.render('rate-portfolio', {
        post_id: post_id
    })
})

router.get('/users/:username', async (req, res) => {
    const user = await User.findOne({ 'username': req.params.username});
    if (user.badge) {
        res.send('yes')
        res.render('badge', {user: user, layout: false})
    }
    else {
        res.sendStatus(404)
    }
})

module.exports = router;