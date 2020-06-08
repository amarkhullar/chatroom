const express = require('express')
const router = express.Router()
const passport = require('passport')
const bodyParser = require('body-parser')

const rooms  = { name: {}}

// router.get('/',(req,res) => {
//     res.render('index',{room:rooms})
// }) 

// router.use(bodyParser.urlencoded({ extended: true }))

// router.get('/:room', (res,req) => {
//     res.render('room',{roomName : req.params.room})
// })

module.exports = router