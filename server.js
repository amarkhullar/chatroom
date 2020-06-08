if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

const express = require('express')
const app = express()
const mongoose = require('mongoose')
const expressLayouts = require('express-ejs-layouts')
const bodyParser = require('body-parser')
const session = require('express-session')
const flash = require('connect-flash')
const passport = require('passport')
const http = require('http')
const server = http.createServer(app);
const socketio = require('socket.io')
const io = socketio(server);

require('./config/passport')(passport)

const port = parseInt(process.env.PORT,10) || 3000;

// sets up mongodb
mongoose.connect(process.env.DATABASE_URL,{useNewUrlParser: true})
const db = mongoose.connection
db.on('error',error => console.error(error))
db.once('open',() => console.log('Connected to DB'))


io.on('connection',socket => {
    console.log('new WS connection');
});

// ejs
app.set('view engine','ejs')
app.set('views', __dirname + '/views')
app.set('layout', 'layouts/layout')

app.use(express.json())
app.use(expressLayouts)
app.use(express.static('public'))

// express session
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

//flash
app.use(flash());

//flash vars
app.use((req,res,next) => {
    res.locals.success_msg  = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
});

// passport
app.use(passport.initialize());
app.use(passport.session())

// body parser for http requests
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
//app.use(express.urlencoded({extended:true}))

// routes
const indexRouter = require('./routes/index')
const loginRouter = require('./routes/login')
const registerRouter = require('./routes/register')
const snakeRouter = require('./routes/snake')

let rooms = {name: {}};

// routers
app.use('/',indexRouter)
app.use('/login',isNotLoggedIn,loginRouter)
app.use('/register',isNotLoggedIn,registerRouter)
// var path = require('path');
// app.get('/snake',(req,res) => {
//     res.sendFile(path.join(__dirname, '/public', 'snake.html'));
// })
//app.use('/snake',res.sendFile(path.join(__dirname, '../public', 'index1.html')))

app.get('/',isLoggedIn, (req,res) => {
    res.render('index.ejs',{name: req.user.username,rooms:rooms})
});

app.post('/room',(req,res) => {
    if(rooms[req.body.room] != null) {
        // add error msg
        return res.redirect('/')
    }
    rooms[req.body.room] = {users : {}}
    res.redirect(req.body.room)
    io.emit('room-created',req.body.room)

})

app.get('/:room', isLoggedIn, (req,res) => {
    if(rooms[req.params.room] == null) {
        // add error msg
        res.redirect('/')
    }
    res.render('room',{roomName : req.params.room})
})


function isLoggedIn(req,res,next) {
    if(req.isAuthenticated()) {
        return next()
    }
    res.redirect('login')
}

function isNotLoggedIn(req,res,next) {
    if(req.isAuthenticated()) {
        return res.redirect('/')
    }
    next()
}


app.listen(port)