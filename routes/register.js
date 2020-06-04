const express = require('express')
const router = express.Router()
const User = require('../models/user')
const bcrypt = require('bcryptjs')

router.get('/',(req,res) => {
    res.render('register')
})

router.post('/',(req,res) => {

    let errors = [];

    var username = req.body.username;
    var password = req.body.password;
    var password2 = req.body.password2;

    if(!username || !password || !password2) {
        errors.push({msg: "Please fill in all fields"});
    }

    if(password !== password2) {
        errors.push({msg: "Passwords do not match"});
    }

    if(errors.length > 0) {
        res.render('register',{errors});
    }else {
    
        User.findOne({username:username}).then(user => {
            if(user) {
                errors.push({msg: 'Username is already taken'});
                res.render('register',{errors});
            }else {

                var newUser = new User();
                newUser.username = username;
                newUser.password = password;
                
                bcrypt.genSalt(10,(err,salt) => 
                    bcrypt.hash(newUser.password,salt,(err,hash) => {
                        if(err) throw err;
                        newUser.password = hash;
                        newUser.save()
                        .then(user => {
                            req.flash('success_msg','Successfully registered');
                            res.redirect('login');
                        })
                        .catch(err => console.log(err));
                }))
            }
        })
    }

})

module.exports = router