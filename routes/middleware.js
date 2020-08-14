const {validationResult} = require('express-validator');
const Bracket = require('../models/bracket');
const moment = require('moment');
const {SUBMIT_DEADLINE} = require('./utils/index')


module.exports = {
    // to get extra arguments we wrap the middleware in a function, and it is called [with ()] when calling middleware
    handleCheckErrors(renderedPage){
        return (req,res,next)=>{
            const errors = validationResult(req);
            if(!errors.isEmpty()){
                console.log(errors.mapped());
                return res.render(renderedPage,{checkErrors : errors.mapped()});
            }
            next();
        }
    },
    isLoggedIn(req,res,next){
        if(req.isAuthenticated()){
            return next();
        }
        req.flash('error',"You must be logged in to continue");
        res.redirect('/signin');
    } ,
    isAdmin(req,res,next){
        if(req.user.isAdmin){
            return next();
        }
        req.flash('error',"You must have admin premissions to continue");
        // redirect to dashboard ??
        res.redirect('/signin');
    },
    // haveBracket - checks if this user already have a bracket submitted
    async checkHasBracket(req,res,next){
        const bracket = await Bracket.findOne({"owner.id" : req.user._id});
        if(bracket){
            req.flash('error','Already have a bracket, cannot create a new one');
            return res.redirect('/bracket');
        }
        next();
    },
    // isBracketValid
    isBracketValid(req,res,next){
        if(req.user.isAdmin){
            return next();
        }
        const confs = ['east','west'];
        const rounds = ['fr','sf','cf','finals']
        if(!req.body.playin){
            console.log('Playin error');
            req.flash('error','No play-in team winner selected');
            return res.redirect('/bracket');
        }
        for (let conf of confs){
            for(let round of rounds){
                if(round==='finals'){
                    let homeTeam = req.body[`all-finals-1|home`];
                    let awayTeam = req.body[`all-finals-1|away`];
                    if((homeTeam !== '4' && awayTeam!=='4') || (homeTeam === '4' && awayTeam === '4')){
                        //console.log('finals not properly submitted');
                        req.flash('error','Bracket entered is not valid');
                        return res.redirect('/bracket');
                    }
                    continue;
                }
                for(let matchup=1;matchup<=4;matchup++){
                    if((round==='sf' && matchup>=3) || (round==='cf' && matchup>=2)){
                        break;
                    }
                    homeTeam = `${conf}-${round}-${matchup}|home`;
                    awayTeam = `${conf}-${round}-${matchup}|away`;
                    if((req.body[homeTeam] !== '4' && req.body[awayTeam]!=='4') || (req.body[homeTeam] === '4' && req.body[awayTeam] === '4')){
                        //console.log(`Error in ${conf}-${round}-${matchup}` , req.body[homeTeam],req.body[awayTeam]);
                        req.flash('error','Bracket entered is not valid');
                        return res.redirect('/bracket');
                    }
                }
            }
        }
        next();
    },
    async checkBracketOwnership(req,res,next){
        if(req.user.isAdmin){ //admin can do anything
            return next();
        }
        try{
            const bracket = await Bracket.findById(req.params.id);
            if(!bracket.owner.id.equals(req.user._id)){
                throw new Error('No premissions to modify this bracket')
            }

            next()
        } catch (err){
            req.flash('error',err.message);
            res.redirect('/bracket');
        }
    },
    isDeadlinePassed(req,res,next){
        if(moment(Date.now()).isAfter(moment(SUBMIT_DEADLINE))){
            req.flash('error','Cannot preform this operation after submit deadline');
            return res.redirect('/bracket')
        }
        next();
    }
}