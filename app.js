const express = require('express'),
      bodyParser = require('body-parser'),
      mongoose = require('mongoose'),
      methodOverride = require('method-override'),
      passport = require('passport'),
      LocalStrategy = require('passport-local'),
      flash = require('connect-flash'),
      Bracket = require('./models/bracket'),
      User = require('./models/user'),
      {SUBMIT_DEADLINE} = require('./routes/utils/index')
      app = express();
require('dotenv').config();
// Route Reqs
const authRoutes = require('./routes/admin/auth'),
      bracketRoutes = require('./routes/bracket/index'),
      auxRoutes = require('./routes/index');

// App Setup
app.use(bodyParser.urlencoded({extended:true}));
app.set('view engine','ejs');
app.use(express.static(__dirname+'/public'));
//methodOverride
app.use(methodOverride("_method"));
//moment.js
app.locals.moment = require("moment"); //time data output
app.locals.SUBMIT_DEADLINE = SUBMIT_DEADLINE;
//mongoose
mongoose.connect(`mongodb+srv://GuyHaviv:${process.env.MONGOPW}@nbaplayoffs.kpb8b.mongodb.net/NBAPlayoffs?retryWrites=true&w=majority`,{ useNewUrlParser: true , useUnifiedTopology: true } );
mongoose.set('useCreateIndex', true);

// Passport Setup
app.use(require("express-session")({
    secret : `${process.env.EXP_SECRET}`,
    resave : false,
    saveUninitialized : false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Local variables
app.use(function(req,res,next){
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

// Route Setup
app.use(authRoutes);
app.use(bracketRoutes);
app.use(auxRoutes);


app.listen(process.env.PORT || 3000,process.env.IP,()=>console.log("NBA Playoffs Predictor is listening..."));