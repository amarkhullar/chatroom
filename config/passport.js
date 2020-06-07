const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../models/user');

module.exports = function(passport) {
    passport.use(
        new LocalStrategy({usernameField: 'username'},(username,password,done) => {
            User.findOne({username: username})
            .then(user => {
                if(!user) {
                    return done(null,false,{message: 'Incorrect login details'})
                }

                bcrypt.compare(password,user.password, (err,isMatch) => {
                    if(err) throw err;
                    if(isMatch) {
                        return done(null,user);
                    }else {
                        return done(null,false,{message:'Incorrect login details'});
                    }
                });
            })
            .catch(err => console.log(err));
        })
    );

    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });
    
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });
}