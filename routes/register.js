const express = require('express')
const router = express.Router()
const User = require('../models/user')

router.get('/',(req,res) => {
    res.render('register')
})

router.post('/',(req,res) => {

    let errors = [];

    var username = req.body.username;
    var password = req.body.password;
    var password2 = req.body.password2;
    console.log(req.body.username);
    if(!username || !password || !password2) {
        errors.push({msg: "Please fill in all fields"});
    }

    if(password !== password2) {
        errors.push({msg: "Passwords do not match"});
    }

    if(errors.length > 0) {
        res.render('register', {
            errors
        });
        console.log(errors.length);
    }else {

        res.send('pass')
    
        User.findOne({username:username}).then(user => {
            if(user) {

                errors.push({msg: 'Username is already taken'});
                res.render('register');

            }else {

                var newUser = new User();
                newUser.username = username;
                newUser.password = password;
        
                newUser.save(function(err,savedUser) {
                    if(err) {
                        console.log(err);
                        return res.status(500).send();
                    }
                    return res.status(200).send();

                })
            }
        })
    }

})

module.exports = router