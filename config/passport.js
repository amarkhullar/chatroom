const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../models/User');

module.exports = function(passport) {
    passport.use(
        new LocalStrategy({usernameField: 'username'},(username,password,done) => {
            User.findOne({username: username})
            .then(user => {
                if(!user) {
                    return done(null,false,{message: 'Username is not registered'})
                }
            })
            .catch(err => console.log(err));
        })
    );
}