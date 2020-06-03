if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

const express = require('express')
const app = express()
const port = parseInt(process.env.PORT,10) || 3000;
const mongoose = require('mongoose')
const expressLayouts = require('express-ejs-layouts')
const indexRouter = require('./routes/index')
const loginRouter = require('./routes/login')
const registerRouter = require('./routes/register')
var bodyParser = require('body-parser')

mongoose.connect(process.env.DATABASE_URL,{useNewUrlParser: true})
const db = mongoose.connection
db.on('error',error => console.error(error))
db.once('open',() => console.log('Connected to DB'))

app.set('view engine','ejs')
app.set('views', __dirname + '/views')
app.set('layout', 'layouts/layout')

app.use(express.json())
app.use(expressLayouts)
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use('/',indexRouter)
app.use('/login',loginRouter)
app.use('/register',registerRouter)
// app.get('/login',(req,res) => {
//     res.render('login.ejs')
// })

// app.get('/register',(req,res) => {
//     res.render('register.ejs')
// })

// app.post('/register',(req,res) => {
//     req.body.name
// })

// app.post('/login',(req,res) => {

// })

app.listen(port)