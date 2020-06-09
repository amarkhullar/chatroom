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

// routes
const loginRouter = require('./routes/login')
const registerRouter = require('./routes/register')


// routers
app.use('/login',isNotLoggedIn,loginRouter)
app.use('/register',isNotLoggedIn,registerRouter)

app.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
  });

var username = '';
app.get('/',isLoggedIn, (req,res) => {
    username = req.user.username;
    res.render('index.ejs',{name: req.user.username,rooms:rooms})
});

const rooms = { }

app.get('/', (req, res) => {
  res.render('index', { rooms: rooms, username: username})
})

app.post('/room', (req, res) => {
    if (rooms[req.body.room] != null) {
        req.flash('error_msg','Room already exists')
        return res.redirect('/')
    }
    rooms[req.body.room] = { users: {} }
    res.redirect(req.body.room)
    io.emit('room-created', req.body.room)
})

app.get('/:room', (req, res) => {
    if (rooms[req.params.room] == null) {
        return res.redirect('/')
    }
    res.render('room', { roomName: req.params.room, username: username})
})

server.listen(3000)

io.on('connection', socket => {
    socket.on('new-user', (room, name) => {
        socket.join(room)
        rooms[room].users[socket.id] = name
        socket.to(room).broadcast.emit('user-connected', name)
    })
    socket.on('send-chat-message', (room, message) => {
        socket.to(room).broadcast.emit('chat-message', { message: message, name: rooms[room].users[socket.id] })
    })
    socket.on('disconnect', () => {
        getUserRooms(socket).forEach(room => {
        socket.to(room).broadcast.emit('user-disconnected', rooms[room].users[socket.id])
        delete rooms[room].users[socket.id]
        })
    })
})

function getUserRooms(socket) {
    return Object.entries(rooms).reduce((names, [name, room]) => {
        if (room.users[socket.id] != null) names.push(name)
        return names
    }, [])
}

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
