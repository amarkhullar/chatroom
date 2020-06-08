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



// app.get('/',isLoggedIn, (req,res) => {
//     res.render('index.ejs',{name: req.user.username})
// });


// body parser for http requests
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

// routes
const indexRouter = require('./routes/index')
const loginRouter = require('./routes/login')
const registerRouter = require('./routes/register')
const snakeRouter = require('./routes/snake')

// routers
app.use('/',indexRouter)
app.use('/login',isNotLoggedIn,loginRouter)
app.use('/register',isNotLoggedIn,registerRouter)
app.use('/snake',isLoggedIn,snakeRouter)

function isLoggedIn(req,res,next) {
    if(req.isAuthenticated()) {
        return next()
    }
    res.render('login.ejs')
}

function isNotLoggedIn(req,res,next) {
    if(req.isAuthenticated()) {
        return res.render('index', {name:req.user.username})
    }
    next()
}

// index

//const rooms  = { name: {}}

// router.get('/',(req,res) => {

//     res.render('index',{rooms : rooms})
// }) 

// router.get('/:room', (res,req) => {
//     res.render('room',{roomName : req.params.room})
// })


// login

// router.get('/',(req,res) => {
//     res.render('login')
// })

// router.post('/',(req,res,next) => {

//     passport.authenticate('local', {
//         successRedirect: '/',
//         failureRedirect: '/login',
//         failureFlash: true

//     })(req,res,next);

// });


//register

// router.get('/',(req,res) => {
//     res.render('register')
// })

// router.post('/',(req,res) => {

//     let errors = [];
//     let successMsg = [];

//     var username = req.body.username;
//     var password = req.body.password;
//     var password2 = req.body.password2;

//     if(!username || !password || !password2) {
//         errors.push({msg: "Please fill in all fields"});
//     }

//     if(password !== password2) {
//         errors.push({msg: "Passwords do not match"});
//     }

//     if(errors.length > 0) {
//         res.render('register',{errors});
//     }else {
    
//         User.findOne({username:username}).then(user => {
//             if(user) {
//                 errors.push({msg: 'Username is already taken'});
//                 res.render('register',{errors});
//             }else {

//                 var newUser = new User();
//                 newUser.username = username;
//                 newUser.password = password;
                
//                 bcrypt.genSalt(10,(err,salt) => 
//                     bcrypt.hash(newUser.password,salt,(err,hash) => {
//                         if(err) throw err;
//                         newUser.password = hash;
//                         newUser.save()
//                         .then(user => {
//                             successMsg.push({msg: 'Successfully registered'});
//                             res.render('login',{successMsg});
//                         })
//                         .catch(err => console.log(err));
//                 }))
//             }
//         })
//     }

// })

app.listen(port)