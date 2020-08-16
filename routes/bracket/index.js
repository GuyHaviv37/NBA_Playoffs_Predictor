const express = require('express'),
      {isLoggedIn,isBracketValid,checkHasBracket,checkBracketOwnership,isDeadlinePassed} = require('../middleware'),
      {parsePredictions,updateScores} = require('../utils/index')
      User = require('../../models/user'),
      Bracket = require('../../models/bracket'),
      {teamInfo,abbrvTrans} = require('../utils/teamInfo');
const router = express.Router();

// DASHBOARD ROUTE - SEE MY BRACKET
router.get('/bracket',isLoggedIn,async (req,res)=>{
    const bracket = await Bracket.findOne({"owner.id" : req.user._id})
    res.render('bracket/dashboard',{bracket});
})

// CREATE ROUTES
router.get('/bracket/new',isLoggedIn,checkHasBracket,isDeadlinePassed,(req,res)=>{
    res.render('bracket/new')
})

router.post('/bracket/new',isLoggedIn,checkHasBracket,isDeadlinePassed,isBracketValid,async (req,res)=>{
    const owner = {
        id : req.user._id,
        username : req.user.username
    }
    const bracketName = req.body.bracketName ? req.body.bracketName : `${owner.username}'s Bracket`;
    const bracketInfo = {owner,bracketName};
    const newBracket = await Bracket.create(bracketInfo); //add error handling
    const [predictions,winner] = parsePredictions(req.body);
    if(req.user.isAdmin){
        newBracket.isAdminBracket = true;
    }
    newBracket.predictions = predictions;
    newBracket.winner = winner;
    newBracket.save();
    res.redirect('/bracket');
})

//SHOW ROUTES
// Comment : technically one can see another's bracket before submit deadline
router.get('/bracket/:id',async (req,res)=>{
    try{
        const bracket = await Bracket.findById(req.params.id);
        res.render('bracket/show',{bracket,teamInfo,abbrvTrans});
    } catch (err){
        req.flash('error','No bracket found');
        res.redirect('/bracket')
    }
})

// EDIT ROUTES
router.get('/bracket/:id/edit',isLoggedIn,isDeadlinePassed,checkBracketOwnership,async (req,res)=>{
    try{
        const bracket = await Bracket.findById(req.params.id);
        res.render('bracket/edit',{bracket});
    } catch (err){
        req.flash('error','No bracket found');
        res.redirect('/bracket');
    }
})

router.put('/bracket/:id/edit',isLoggedIn,checkBracketOwnership,isDeadlinePassed,isBracketValid,async (req,res)=>{
    try{
        const foundBracket = await Bracket.findById(req.params.id);
        const bracketName = req.body.bracketName ? req.body.bracketName : `${owner.username}'s Bracket`;
        const [predictions,winner] = parsePredictions(req.body);
        foundBracket.bracketName = bracketName;
        foundBracket.predictions = predictions;
        foundBracket.winner = winner;
        foundBracket.lastUpdated = Date.now();
        await foundBracket.save();
        if(foundBracket.isAdminBracket){
            await updateScores(foundBracket);
        }
        res.redirect('/bracket')
    } catch (err){
        req.flash('error',err.message);
        res.redirect('/bracket');
    }
})

// DESTORY ROUTES
router.delete('/bracket/:id',isLoggedIn,isDeadlinePassed,checkBracketOwnership,async (req,res)=>{
    try{
        await Bracket.findByIdAndDelete(req.params.id);
        res.redirect('/bracket');
    } catch (err) {
        req.flash('error','Could not delete bracket');
        res.redirect('/bracket')
    }
})


module.exports = router;