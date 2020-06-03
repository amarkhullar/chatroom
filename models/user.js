const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    username: {
        type: String,
    },
    password: {
        type: String,
    }
})

var User = mongoose.model('newusers',userSchema);
module.exports = User;