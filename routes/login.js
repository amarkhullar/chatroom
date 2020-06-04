const express = require('express')
const router = express.Router()
const User = require('../models/user')

router.get('/',(req,res) => {
    res.render('login')
})

router.post('/',(req,res) => {
    var username = req.body.username;
    var password = req.body.password;

    let errors = [];

    User.findOne({username: username, password: password}, function(err,user) {
        if(err) {
            console.log(err);
            return res.status(500).send();
        }

        if(!user) {
            errors.push({msg: "Incorrect login details, please try again"})
            res.render('login', {
                errors
            });
        }else {
            return res.status(200).send();
        }

        
    })
})

module.exports = router