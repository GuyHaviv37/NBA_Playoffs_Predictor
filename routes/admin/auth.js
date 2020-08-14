const { CLIENT_RENEG_LIMIT } = require('tls');

const express = require('express'),
passport = require('passport'),
User = require('../../models/user'),
{requireUsername,requireEmail,requirePassword,requirePasswordConfirmation} = require('./validators'),
{handleCheckErrors} = require('../middleware'),
nodemailer = require('nodemailer'),
async = require('async'),
crypto = require('crypto'),
router = express.Router();

router.get('/signup',(req,res)=>{
    res.render('auth/signup',{checkErrors : null});
})

router.post('/signup',[requireUsername,requireEmail,requirePassword,requirePasswordConfirmation],
handleCheckErrors('auth/signup'),async (req,res)=>{
    const {username,email} = req.body;
    const newUser = new User({username,email});
    try{
        await User.register(newUser,req.body.password);
        passport.authenticate("local")(req,res,()=>{
            req.flash('success',`Welcome ${newUser.username}, thanks for signin up!`)
            res.redirect('/bracket');
        })
    } catch (err) {
        console.log(err);
        req.flash('error','An error occurred creating an Account');
        return res.redirect('/signup');
    }
    
})

router.get('/signin',(req,res)=>{
    res.render('auth/signin');
})

router.post('/signin',
passport.authenticate("local", {
    successRedirect: "/bracket",
    failureRedirect: "/signin",
    successFlash: `Welcome Back !`,
    failureFlash: "Username or Password were invalid"
}),
(req,res)=>{
    //empty
});

router.get('/signout', (req, res) => {
    req.logout();
    req.flash("success", "Successfuly Logged Out")
    res.redirect("/")
})

// FORGOT PASSWORD ROUTES - COPIED FROM A PREVIOUS OLD PROJECT (YelpCamp)
router.get('/forgot',(req,res)=>{
    res.render('auth/forgot')
})

router.post("/forgot", (req, res, next) => {
    async.waterfall([
        function (done) {
            crypto.randomBytes(20, (err, buf) => {
                const token = buf.toString('hex');
                done(err, token);
            });
        },
        function (token, done) {
            User.findOne({ email: req.body.email }, function (err, foundUser) {
                if (!foundUser) {
                    req.flash('error', 'No account found with that e-mail address');
                    return res.redirect("/forgot");
                }
                foundUser.resetPasswordToken = token;
                foundUser.resetPasswordExpire = Date.now() + 36000000; //1 hour
                foundUser.save(function (err) {
                    done(err, token, foundUser);
                });
            });
        },
        function (token, user, done) {
            const smptTransport = nodemailer.createTransport({
                service: 'Gmail',
                auth: {
                    user: 'guyhavivcodes@gmail.com',
                    pass: process.env.GMAILPW
                },
                //Added because of a valid certificate error
                host: 'smtp.gmail.com',
                port: 587,
                ignoreTLS: false,
                secure: false,
                tls: {
                    rejectUnauthorized: false
                }
            });
            const mailOptions = {
                to: user.email,
                from: 'guyhavivcodes@gmail.com',
                subject: 'NBA Playoffs Predictor Account Password Reset',
                text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                    'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                    'http://' + req.headers.host + '/reset/' + token + '\n\n' +
                    'If you did not request this, please ignore this email and your password will remain unchanged.\n'
            };
            smptTransport.sendMail(mailOptions, function (err) {
                if (err) console.log("error in sendMail" + err);
                console.log("reset password mail has been sent");
                req.flash('success', `An e-mail was sent to ${user.email} with further instructions`);
                done(err, 'done');
            });
        }], function (err) {
            if (err) return next(err);
            res.redirect('/forgot');
        });
});

router.get('/reset/:token',async (req,res)=>{
    try{
        const foundUser = await User.findOne({resetPasswordToken : req.params.token , resetPasswordExpire : {$gt : Date.now()}});
        res.render('auth/reset',{token: req.params.token})
    } catch(err){
        req.flash('error',"Password reset token invalid or expired");
        res.redirect("/forgot")
    }
})

router.post("/reset/:token",(req,res)=>{
    async.waterfall([
        function(done){
            User.findOne({resetPasswordToken : req.params.token , resetPasswordExpire : {$gt : Date.now()}},(err,foundUser)=>{
                if(!foundUser){
                    req.flash('error',"Password reset token invalid or expired");
                    return res.redirect("/forgot")
                }
                if(req.body.newPassword === req.body.confirmPassword){
                    foundUser.setPassword(req.body.newPassword,function(err){
                        foundUser.resetPasswordToken = undefined;
                        foundUser.resetPasswordExpire = undefined;
                        foundUser.save(function(err){
                            req.logIn(foundUser,function(err){
                            done(err,foundUser);
                            })
                        })
                    })
                }else{
                    req.flash('error',"Passwords do not match");
                    return res.redirect("/reset/"+req.params.token)
                }
        })
    },function(user,done){
        const smptTransport = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: 'guyhavivcodes@gmail.com',
                pass: process.env.GMAILPW
            },
            //Added because of a valid certificate error
            tls: {
                rejectUnauthorized: false
            }
        });
        const mailOptions = {
            to: user.email,
            from: 'guyhavivcodes@gmail.com',
            subject: 'NBA Playoffs Predictor - Password was changed successfully',
            text: 'Hello,\n\n' +
            'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
        };
        smptTransport.sendMail(mailOptions,function(err){
            req.flash('success',"Your password was changed successfully !");
            done(err);
        });
    }],function(err){
        if(err){
            req.flash('error',"Something bad happend...")
            return res.redirect('/forgot')
        }
        return res.redirect("/")
        }
    )
})


module.exports = router;

