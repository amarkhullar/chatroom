const express = require('express')
const router = express.Router()
const User = require('../models/user')
const passport = require('passport')

router.get('/',(req,res) => {

    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    let box = 32
    ctx.fillStyle = "black";
    ctx.fillRect(5*box,6*box,2*box,3*box);
    
    res.render('snake',{name:req.user.username})
}) 


module.exports = router